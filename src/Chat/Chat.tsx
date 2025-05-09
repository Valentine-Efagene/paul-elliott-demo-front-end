import { useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Channels, Rooms, type IMessage } from '../type';

export default function Chat() {
    const [token, setToken] = useState<string>('');
    const [connected, setConnected] = useState(false);
    const [log, setLog] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const socketRef = useRef<Socket | null>(null);

    const addLog = (entry: string) => {
        setLog((prev) => [...prev, entry]);
    };

    const connectSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        const _socket = io('http://localhost:3100/chat', {
            auth: {
                token,
                email: 'test@tester.com',
            },
        });

        socketRef.current = _socket;

        _socket.on('connect', () => {
            setConnected(true);
            addLog(`Connected with ID: ${_socket.id}`);
        });

        _socket.on('disconnect', () => {
            setConnected(false);
            addLog('Disconnected');
        });

        _socket.on(Channels.MESSAGES, (data) => {
            console.log('Message from room', { data })
            addLog(`${data?.sender ? data?.sender : 'Server'}: ${data.message}`);
        });

        _socket.on('error', (err) => {
            addLog(`Error: ${JSON.stringify(err)}`);
        });
    };

    const sendMessage = () => {
        const payload: IMessage = {
            title: 'Manual Notification',
            message,
            room: Rooms.CHAT
        };
        socketRef.current?.emit(Channels.GROUP_MESSAGE, payload, (res: IMessage) => {
            // addLog(`Server: ${res.email} sent ${res.message}`);
        });
        addLog(`Sent: ${message}`);
        setMessage('');
    };

    const joinRoom = () => {
        const room = 'chat';
        socketRef.current?.emit(Channels.JOIN_ROOM, { room }, (res: IMessage) => {
            addLog(`Response: ${JSON.stringify(res)}`);
        });
    };

    const leaveRoom = () => {
        const room = 'chat';
        socketRef.current?.emit(Channels.LEAVE_ROOM, { room }, (res: IMessage) => {
            addLog(`Response: ${JSON.stringify(res)}`);
        });
    };

    return (
        <div className="p-4 max-w-xl mx-auto flex flex-col gap-4 items-stretch">
            <div className='flex flex-col gap-2'>
                <label htmlFor="token">Token</label>
                <input
                    id="token"
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Paste your JWT token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                />
                <button
                    onClick={connectSocket}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    disabled={!token}
                >
                    Connect
                </button>
            </div>

            <h1 className="text-xl font-bold mb-4">WebSocket Chat</h1>
            <div>({connected ? 'Connected' : 'Disconnected'})</div>

            <input
                type="text"
                className="border rounded px-2 py-1 w-full"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <div className='flex gap-4'>
                <button onClick={joinRoom} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={!connected}>
                    Join Room
                </button>
                <button onClick={leaveRoom} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={!connected}>
                    Leave Room
                </button>
            </div>

            <div className='flex gap-4'>
                <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={!connected}>
                    Send Message
                </button>
                <button
                    onClick={() => {
                        setLog([]);
                        addLog('Messages cleared');
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Clear Messages
                </button>
            </div>

            <div className="mt-4 bg-gray-100 p-2 rounded h-60 overflow-auto text-sm">
                {log.map((entry, index) => (
                    <div key={index} className="mb-1 text-gray-800 text-left">{entry}</div>
                ))}
            </div>
        </div>
    );
}
