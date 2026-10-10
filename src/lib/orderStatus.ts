export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  awaiting_confirmation: "Awaiting Confirmation",
  paid: "Paid",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_MESSAGES: Record<string, string> = {
  pending_payment: "Please transfer the total amount and upload your proof of payment below.",
  awaiting_confirmation: "Thanks! We've received your proof of payment and are confirming it now.",
  paid: "Payment confirmed. Your order is being prepared.",
  shipped: "Your order is on its way.",
  completed: "This order is complete. Thank you for shopping with us.",
  cancelled: "This order has been cancelled.",
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  pending_payment: "badge-neutral",
  awaiting_confirmation: "badge-warning",
  paid: "badge-info",
  shipped: "badge-info",
  completed: "badge-success",
  cancelled: "badge-danger",
};

/** The happy-path order of statuses, used for the progress tracker. */
export const STATUS_STEPS = ["pending_payment", "awaiting_confirmation", "paid", "shipped", "completed"] as const;
