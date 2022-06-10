export type Snowflake = string;

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
}

export type ApplicationCommandOptionChoice = {
  name: string;
  value: string | number;
};

export enum ApplicationCommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
}

export type ApplicationCommand = {
  name: Snowflake;
  type?: ApplicationCommandType;
  description: string;
  options?: ApplicationCommandOption[];
};

export type ApplicationCommandOption = {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
};

export type ApplicationCommandInteractionDataOption = {
  name: string;
  type: ApplicationCommandOptionType;
  value?: ApplicationCommandOptionChoice;
  options?: ApplicationCommandInteractionDataOption[];
};

export enum PermissionType {
  CREATE_INSTANT_INVITE = 1 << 0,
  KICK_MEMBERS = 1 << 1,
  BAN_MEMBERS = 1 << 2,
  ADMINISTRATOR = 1 << 3,
  MANAGE_CHANNELS = 1 << 4,
  MANAGE_GUILD = 1 << 5,
  ADD_REACTIONS = 1 << 6,
  VIEW_AUDIT_LOG = 1 << 7,
  PRIORITY_SPEAKER = 1 << 8,
  STREAM = 1 << 9,
  VIEW_CHANNEL = 1 << 10,
  SEND_MESSAGES = 1 << 11,
  SEND_TTS_MESSAGES = 1 << 12,
  MANAGE_MESSAGES = 1 << 13,
  EMBED_LINKS = 1 << 14,
  ATTACH_FILES = 1 << 15,
  READ_MESSAGE_HISTORY = 1 << 16,
  MENTION_EVERYONE = 1 << 17,
  USE_EXTERNAL_EMOJIS = 1 << 18,
  VIEW_GUILD_INSIGHTS = 1 << 19,
  CONNECT = 1 << 20,
  SPEAK = 1 << 21,
  MUTE_MEMBERS = 1 << 22,
  DEAFEN_MEMBERS = 1 << 23,
  MOVE_MEMBERS = 1 << 24,
  USE_VAD = 1 << 25,
  CHANGE_NICKNAME = 1 << 26,
  MANAGE_NICKNAMES = 1 << 27,
  MANAGE_ROLES = 1 << 28,
  MANAGE_WEBHOOKS = 1 << 29,
  MANAGE_EMOJIS_AND_STICKERS = 1 << 30,
  USE_APPLICATION_COMMANDS = 1 << 31,
  REQUEST_TO_SPEAK = 1 << 32,
  MANAGE_THREADS = 1 << 34,
  USE_PUBLIC_THREADS = 1 << 35,
  USE_PRIVATE_THREADS = 1 << 36,
  USE_EXTERNAL_STICKERS = 1 << 37,
}

export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
  MessageComponent = 3,
}

export type OptionType = any;

export type ApplicationCommandInteractionData = {
  id: string;
  name: string;
  options?: ApplicationCommandInteractionDataOption[];
  custom_id?: string;
  component_type: number;
  resolved?: any;
};

export type GuildMember = {
  deaf: boolean;
  is_pending: boolean;
  joined_at: string;
  mute: boolean;
  nick?: string;
  pending: boolean;
  permissions: string;
  premium_since?: string;
  roles: string[];
  user: {
    avatar?: string;
    discriminator: string;
    id: string;
    public_flags: number;
    username: string;
  };
};

export type Interaction = {
  id: string;
  type: InteractionType;
  data?: ApplicationCommandInteractionData;
  guild_id: string;
  channel_id: string;
  member: GuildMember;
  token: string;
  version: number;
};

export enum InteractionResponseType {
  Pong = 1,
  Acknowledge = 2,
  ChannelMessage = 3,
  ChannelMessageWithSource = 4,
  AcknowledgeWithSource = 5,
}

export enum AllowedMentionTypes {
  roles = "roles",
  users = "users",
  everyone = "everyone",
}

export type AllowedMentions = {
  parse?: AllowedMentionTypes[];
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
};

export enum EmbedType {
  rich = "rich",
  image = "image",
  video = "video",
  gifv = "gifv",
  article = "article",
  link = "link",
}

export type EmbedThumbnail = {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
};

export type EmbedVideo = {
  url?: string;
  height?: number;
  width?: number;
};

export type EmbedImage = {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
};

export type EmbedProvider = {
  name?: string;
  url?: string;
};

export type EmbedAuthor = {
  name?: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
};

export type EmbedFooter = {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
};

export type EmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type Embed = {
  title?: string;
  type?: EmbedType;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
  fields?: EmbedField[];
};

export type InteractionApplicationCommandCallbackData = {
  tts?: boolean;
  content: string;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
};

export type InteractionResponse = {
  type: InteractionResponseType;
  data?: InteractionApplicationCommandCallbackData;
};

export type InteractionHandler = (interaction: Interaction, ...extra: any) => Promise<InteractionResponse> | InteractionResponse;
