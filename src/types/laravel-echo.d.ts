/**
 * TypeScript declarations for Pusher
 * For direct Pusher integration without Laravel Echo
 */

declare module 'pusher-js' {
  interface PusherStatic {
    log: any;
    Runtime: any;
    ScriptReceiver: any;
    DependenciesReceivers: any;
    auth_callbacks: any;
    new(key: string, options?: PusherOptions): Pusher;
  }

  interface PusherOptions {
    cluster?: string;
    authEndpoint?: string;
    auth?: {
      headers?: Record<string, string>;
    };
    forceTLS?: boolean;
    encrypted?: boolean;
    disableStats?: boolean;
    enabledTransports?: string[];
    disabledTransports?: string[];
    wsHost?: string;
    wsPort?: number;
    wssPort?: number;
    httpHost?: string;
    httpPort?: number;
    httpsPort?: number;
  }

  interface Channel {
    name: string;
    bind(eventName: string, callback: Function): Channel;
    unbind(eventName?: string, callback?: Function): Channel;
    trigger(eventName: string, data: any): boolean;
  }

  interface PresenceChannel extends Channel {
    members: {
      count: number;
      get(id: string): any;
      each(callback: Function): void;
      me: any;
    };
  }

  interface Pusher {
    connection: {
      state: string;
      bind(eventName: string, callback: Function): void;
      unbind(eventName?: string, callback?: Function): void;
    };
    key: string;
    channels: {
      find(name: string): Channel | undefined;
    };
    disconnect(): void;
    connect(): void;
    bind(eventName: string, callback: Function): Pusher;
    unbind(eventName?: string, callback?: Function): Pusher;
    bind_global(callback: Function): Pusher;
    unbind_global(callback?: Function): Pusher;
    channel(name: string): Channel;
    allChannels(): Channel[];
    subscribe(channelName: string): Channel;
    unsubscribe(channelName: string): void;
  }

  var Pusher: PusherStatic;
  export = Pusher;
} 