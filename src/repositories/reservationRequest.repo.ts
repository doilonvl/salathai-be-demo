import ReservationRequest, {
  IReservationRequest,
  ReservationStatus,
} from "../models/ReservationRequest";

export type ReservationListOpts = {
  page?: number;
  limit?: number;
  q?: string;
  status?: ReservationStatus;
  dateFrom?: string;
  dateTo?: string;
};

export const reservationRequestRepo = {
  async create(data: Partial<IReservationRequest>) {
    const doc = new ReservationRequest(data);
    return doc.save();
  },

  async update(id: string, data: Partial<IReservationRequest>) {
    return ReservationRequest.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async getById(id: string) {
    return ReservationRequest.findById(id).lean();
  },

  async delete(id: string) {
    return ReservationRequest.findByIdAndDelete(id);
  },

  async list(opts: ReservationListOpts = {}) {
    const { page = 1, limit = 20, q, status, dateFrom, dateTo } = opts;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;

    if (q?.trim()) {
      const rx = new RegExp(q.trim(), "i");
      filter.$or = [
        { fullName: rx },
        { phoneNumber: rx },
        { email: rx },
        { note: rx },
        { source: rx },
      ];
    }

    if (dateFrom || dateTo) {
      filter.reservationDate = {};
      if (dateFrom) filter.reservationDate.$gte = new Date(dateFrom);
      if (dateTo) filter.reservationDate.$lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      ReservationRequest.find(filter)
        .sort({ reservationDate: 1, reservationTime: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ReservationRequest.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
