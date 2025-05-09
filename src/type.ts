export interface IMessage {
    // email: string,
    title: string,
    message: string,
    room: string
    type?: string
}

export interface ICredentials {
    password: string,
    identifier: string,
}

export enum Channels {
    MESSAGES = 'messages',
    JOIN_ROOM = 'join_room',
    LEAVE_ROOM = 'leave_room',
    GROUP_MESSAGE = 'group_message',
}

export enum Rooms {
    CHAT = 'chat',
}