export const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0);

export const deliveredOrders = (orders) =>
  orders.filter(({ status }) => status === "delivered");

export const averageRating = (orders) => {
  const ratedOrders = orders.filter(({ rating }) => rating !== null);

  if (ratedOrders.length === 0) return 0;

  const sum = ratedOrders.reduce(
    (total, { rating }) => total + rating,
    0
  );

  return Number((sum / ratedOrders.length).toFixed(1));
};

export const bestSellingItem = (orders) => {
  const quantities = orders
    .flatMap(({ items }) => items)
    .reduce((totals, { name, qty }) => ({
      ...totals,
      [name]: (totals[name] ?? 0) + qty,
    }), {});

  return Object.entries(quantities)
    .map(([name, qty]) => ({ name, qty }))
    .toSorted((a, b) => b.qty - a.qty)[0];
};

export const revenueByDistrict = (orders) =>
  deliveredOrders(orders).reduce((revenue, order) => {
    const { district } = order.customer;

    return {
      ...revenue,
      [district]: (revenue[district] ?? 0) + orderTotal(order),
    };
  }, {});