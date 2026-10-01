import { io, Socket } from 'socket.io-client';

type MenuChangeCallback = (data: { action: string; menuId: string; userId: string; timestamp: string }) => void;
type QrEstadoCallback = (data: { qrCodigo: string; estado: 'disponible' | 'usado'; almacenId?: string; timestamp: string }) => void;
type MovimientoChangeCallback = (data: { tipo: 'entrada' | 'salida' | 'revocada'; almacenId?: string; movimientoId?: string; timestamp: string }) => void;
type NotificacionCallback = (data: {
    tipo: 'BAJO_MINIMO' | 'REORDEN';
    productoId: string;
    productoCodigo: string;
    productoNombre: string;
    almacenId: string;
    almacenNombre: string;
    stock: number;
    stockMinimo: number;
    stockSeguridad: number;
    puntoReorden: number;
    sugerido: number;
    timestamp: string;
}) => void;

class SocketService {
    private socket: Socket | null = null;
    private menuChangeCallbacks: MenuChangeCallback[] = [];
    private qrEstadoCallbacks: QrEstadoCallback[] = [];
    private movimientoChangeCallbacks: MovimientoChangeCallback[] = [];
    private notificacionCallbacks: NotificacionCallback[] = [];

    /**
     * Deriva la URL del socket desde API_URL (le saca /api/ del final)
     * Ejemplo: http://localhost:3000/api/ → http://localhost:3000
     */
    private getSocketUrl(): string {
        // Mismo criterio que api(): URL pública del cliente primero.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000/api/';
        return apiUrl.replace(/\/api\/?$/, '');
    }

    /**
     * Conecta al socket del API
     * @param token JWT token para autenticación
     */
    connect(token: string): void {
        if (this.socket?.connected) {
            console.log('[Socket] Ya conectado');
            return;
        }

        const url = this.getSocketUrl();
        console.log('[Socket] Conectando a:', url);

        this.socket = io(url, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 15000,
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Conectado correctamente, ID:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[Socket] Desconectado. Razón:', reason);
        });

        this.socket.on('connect_error', (error: any) => {
            console.error('[Socket] Error de conexión:', {
                message: error.message,
                description: error.description,
                type: error.type,
            });
            // Si es el primer intento, loguear más detalles de diagnóstico
            if (error.message?.includes('websocket') || error.message?.includes('xhr')) {
                console.log('[Socket] Diagnóstico: verifica que el API esté corriendo en', url, 'y SOCKET_ENABLED=true');
            }
        });

        // Escuchar evento de cambio de menú
        this.socket.on('menu:change', (data: { action: string; menuId: string; userId: string; timestamp: string }) => {
            console.log('[Socket] Evento menu:change recibido:', data);
            this.menuChangeCallbacks.forEach((cb) => cb(data));
        });

        // Escuchar cambio de estado de QR (entrada → usado, salida → disponible)
        this.socket.on('qr:estado', (data: { qrCodigo: string; estado: 'disponible' | 'usado'; almacenId?: string; timestamp: string }) => {
            console.log('[Socket] Evento qr:estado recibido:', data);
            this.qrEstadoCallbacks.forEach((cb) => cb(data));
        });

        // Escuchar movimiento de entrada/salida (para refrescar el dashboard)
        this.socket.on('movimiento:change', (data: { tipo: 'entrada' | 'salida' | 'revocada'; almacenId?: string; movimientoId?: string; timestamp: string }) => {
            console.log('[Socket] Evento movimiento:change recibido:', data);
            this.movimientoChangeCallbacks.forEach((cb) => cb(data));
        });

        // Push de umbrales de stock (campana — backlog P2)
        this.socket.on('notificacion', (data: any) => {
            console.log('[Socket] Evento notificacion recibido:', data);
            this.notificacionCallbacks.forEach((cb) => cb(data));
        });
    }

    /**
     * Desconecta el socket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            console.log('[Socket] Desconectado manualmente');
        }
    }

    /**
     * Registra un callback para cuando se reciba un evento de cambio de menú
     */
    onMenuChange(callback: MenuChangeCallback): () => void {
        this.menuChangeCallbacks.push(callback);
        return () => {
            this.menuChangeCallbacks = this.menuChangeCallbacks.filter((cb) => cb !== callback);
        };
    }

    /**
     * Registra un callback para cuando un QR cambie de estado (usado ↔ disponible)
     */
    onQrEstado(callback: QrEstadoCallback): () => void {
        this.qrEstadoCallbacks.push(callback);
        return () => {
            this.qrEstadoCallbacks = this.qrEstadoCallbacks.filter((cb) => cb !== callback);
        };
    }

    /**
     * Registra un callback para cuando ocurra una entrada/salida (refresco del dashboard)
     */
    onMovimientoChange(callback: MovimientoChangeCallback): () => void {
        this.movimientoChangeCallbacks.push(callback);
        return () => {
            this.movimientoChangeCallbacks = this.movimientoChangeCallbacks.filter((cb) => cb !== callback);
        };
    }

    /**
     * Registra un callback para push de umbrales de stock (BAJO_MINIMO/REORDEN)
     */
    onNotificacion(callback: NotificacionCallback): () => void {
        this.notificacionCallbacks.push(callback);
        return () => {
            this.notificacionCallbacks = this.notificacionCallbacks.filter((cb) => cb !== callback);
        };
    }

    /**
     * Emite un evento al servidor
     */
    emit(event: string, data?: any): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('[Socket] No conectado, no se pudo emitir:', event);
        }
    }

    /**
     * Verifica si el socket está conectado
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

// Singleton
export const socketService = new SocketService();
