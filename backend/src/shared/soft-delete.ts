export type SoftDeleteFilter = {
  deletedAt?: null;
};

export const activeOnly = <T extends object>(where?: T): T & SoftDeleteFilter => ({
  ...(where ?? {}),
  deletedAt: null,
} as T & SoftDeleteFilter);

export const softDeleteData = () => ({
  deletedAt: new Date(),
});
