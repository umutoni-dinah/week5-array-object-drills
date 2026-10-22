import { orders } from "./data.js";

// Save the original data once. We compare it after the exercises to check
// that our solutions did not change the imported orders.
const ORIGINAL = JSON.stringify(orders);

// 1. map creates a new array containing just each order's id.
const orderIds = orders.map(({ id }) => id);
console.log("1. Order IDs:", orderIds);

// 2. Follow the nested path customer.name. Duplicates are allowed here.
const customerNames = orders.map(({ customer: { name } }) => name);
console.log("2. Customer names:", customerNames);

// 3. filter keeps every order whose status is delivered.
const deliveredOrders = orders.filter(({ status }) => status === "delivered");
console.log("3. Delivered order IDs:", deliveredOrders.map(({ id }) => id));

// 4. filter can check a nested property as well.
const gasaboOrders = orders.filter(({ customer: { district } }) => district === "Gasabo");
console.log("4. Gasabo order IDs:", gasaboOrders.map(({ id }) => id));

// 5. find returns the first matching order (or undefined if none matches).
const order106 = orders.find(({ id }) => id === 106);
console.log("5. Order 106:", order106);

// 6. some answers whether at least one order satisfies the condition.
// Ignore null ratings because null means unrated.
const hasLowRating = orders.some(({ rating }) => rating !== null && rating <= 3);
console.log("6. Has rating <= 3:", hasLowRating);

// 7. First filter to pending orders; then every checks that all are unrated.
const pendingOrdersUnrated = orders
  .filter(({ status }) => status === "pending")
  .every(({ rating }) => rating === null);
console.log("7. Are all pending orders unrated?", pendingOrdersUnrated);

// 8. Set removes duplicate names; spread turns the Set back into an array.
const uniqueCustomerNames = [...new Set(customerNames)];
console.log("8. Unique customer names:", uniqueCustomerNames);

// The exercises above only read orders and create new arrays.
console.log("Original data unchanged:", JSON.stringify(orders) === ORIGINAL);



// STATION 2 — Calculations with reduce
// For each item, multiply its price by its quantity, then add that amount
// to the running total. The 0 is the starting value for the sum.
const orderTotal = ({ items }) =>
  items.reduce((sum, { price, qty }) => sum + price * qty, 0);

// 1. map creates a new array, and spread creates a new object for each order.
// The imported orders are left untouched.
const ordersWithTotals = orders.map((order) => ({
  ...order,
  total: orderTotal(order),
}));
console.log("Station 2.1. Orders with totals:", ordersWithTotals);


//2.calculate delivered revenue
//Keep delivered orders, then add each order's total to the running sum.
const deliveredRevenue = orders
  .filter(({ status }) => status === "delivered")
  .reduce((sum, order) => sum + orderTotal(order), 0);
console.log("Station 2.2. Delivered revenue:", deliveredRevenue);


//3.calculate the average rating
// Filter out unrated orders, sum the remaining ratings, and divide by
// the number of ratings. Math.round rounds to the nearest whole number;
// multiplying and dividing by 10 keeps one digit after the decimal point.
const ratedOrders = orders.filter(({ rating }) => rating !== null);
const averageRating = Number(
  (
    ratedOrders.reduce((sum, { rating }) => sum + rating, 0) /
    ratedOrders.length
  ).toFixed(1)
);
console.log("Station 2.3. Average rating:", averageRating);

//4.Count Brochettes sold
//flatMap collects the items from all orders into one flat array.
// filter keeps Brochettes; reduce adds their quantities.
const brochettesSold = orders
  .flatMap(({ items }) => items)
  .filter(({ name }) => name === "Brochette")
  .reduce((sum, { qty }) => sum + qty, 0);
console.log("Station 2.4. Brochettes sold:", brochettesSold);

//5.Find the most expensive order
//Keep the order with the largest total. reduce carries the current
// highest-total order as its accumulator.
const mostExpensiveOrder = orders.reduce((mostExpensive, order) =>
  orderTotal(order) > orderTotal(mostExpensive) ? order : mostExpensive
);
console.log("Station 2.5. Most expensive order:", {
  id: mostExpensiveOrder.id,
  customer: mostExpensiveOrder.customer.name,
  total: orderTotal(mostExpensiveOrder),
});

// 6.Count orders per status
// Build a summary object. For each order, increment that status's count.
const ordersPerStatus = orders.reduce((counts, { status }) => ({
  ...counts,
  [status]: (counts[status] ?? 0) + 1,
}), {});
console.log("Station 2.6. Orders per status:", ordersPerStatus);

// The exercises above only read orders and create new arrays.
console.log("Original data unchanged:", JSON.stringify(orders) === ORIGINAL);


//STATION 3
//Revenue per district from delivered orders
//First, filter keeps only delivered orders. Then reduce builds an object: each district is a key, and its value is the running revenue total.
const revenuePerDistrict = orders
  .filter(({ status }) => status === "delivered")
  .reduce((revenue, order) => {
    const { district } = order.customer;
    const total = orderTotal(order);

    return {
      ...revenue,
      [district]: (revenue[district] ?? 0) + total,
    };
  }, {});

console.log(revenuePerDistrict);
//revenue[district] ?? 0 means: use the amount already recorded for this district, or start at 0 if this is the first order there.

//2. Group orders by date and summarize them
//Object.groupBy collects orders into groups using their date. 
// Then Object.entries turns the groups into date-and-orders pairs. map turns each pair into the summary object.
const ordersGroupedByDate = Object.groupBy(
  orders,
  ({ date }) => date
);

const dailySummary = Object.entries(ordersGroupedByDate).map(
  ([date, dateOrders]) => ({
    date,
    count: dateOrders.length,
    revenue: dateOrders.reduce(
      (sum, order) => sum + orderTotal(order),
      0
    ),
  })
);

console.log(dailySummary);

//3.Top 3 best-selling items by quantity
//Flatten all menu items, then add each item's quantity into a totals object
// keyed by item name. Convert the object entries into { name, qty } objects,
// sort a copy descending with toSorted, then take the first three.
const itemQuantities = orders
  .flatMap(({ items }) => items)
  .reduce((totals, { name, qty }) => ({
    ...totals,
    [name]: (totals[name] ?? 0) + qty,
  }), {});

const topThreeItems = Object.entries(itemQuantities)
  .map(([name, qty]) => ({ name, qty }))
  .toSorted((a, b) => b.qty - a.qty)
  .slice(0, 3);

console.log(topThreeItems);


//4. Count orders and total spending per customer
//reduce builds a summary object keyed by customer name. For each order, 
// it increments that customer’s order count and adds the order total. 
// Then we convert the object to the requested array and sort by spent, highest first.
const customerTotals = orders.reduce((totals, order) => {
  const { name } = order.customer;
  const previous = totals[name] ?? { orders: 0, spent: 0 };

  return {
    ...totals,
    [name]: {
      orders: previous.orders + 1,
      spent: previous.spent + orderTotal(order),
    },
  };
}, {});

const customerSpending = Object.entries(customerTotals)
  .map(([name, totals]) => ({
    name,
    orders: totals.orders,
    spent: totals.spent,
  }))
  .toSorted((a, b) => b.spent - a.spent);

console.log(customerSpending);

//5.Build a menu price object
//flatMap gathers the menu items. 
// Each item becomes a [name, price] pair. Map keeps one price per item name, 
// and Object.fromEntries turns those pairs into a plain object.
const menuPrices = Object.fromEntries(
  new Map(
    orders
      .flatMap(({ items }) => items)
      .map(({ name, price }) => [name, price])
  )
);

console.log(menuPrices);


//STATION 4
//1. markDelivered(orders, id)
//Find the order by id. If it’s pending, make a copy with its status changed. All other orders stay unchanged.
const markDelivered = (orders, id) =>
  orders.map((order) =>
    order.id === id && order.status === "pending"
      ? { ...order, status: "delivered" }
      : order
  );
  const updatedDelivery = markDelivered(orders, 105);
console.log(updatedDelivery.find(({ id }) => id === 105).status);

//rateOrder(orders, id, rating)
//Only update the rating when the order is delivered. If it isn’t delivered,
//  the function returns a new array with the order contents unchanged.
const rateOrder = (orders, id, rating) =>
  orders.map((order) =>
    order.id === id && order.status === "delivered"
      ? { ...order, rating }
      : order
  );
//a deliveredorder and a pending one.
  console.log(rateOrder(orders, 101, 3).find(({ id }) => id === 101).rating);
// 3

console.log(rateOrder(orders, 105, 3).find(({ id }) => id === 105).rating);
// null — it was pending, so its rating stays unchanged


//changeDistrict(orders, id, district)
//Because district is nested inside customer, copy both the order and its customer object.
const changeDistrict = (orders, id, district) =>
  orders.map((order) =>
    order.id === id
      ? {
          ...order,
          customer: { ...order.customer, district },
        }
      : order
  );
  //Try changing order 101’s district:
const movedOrder = changeDistrict(orders, 101, "Kicukiro");
console.log(movedOrder.find(({ id }) => id === 101).customer.district);
// "Kicukiro"

//addItem(orders, id, item)
const addItem = (orders, id, item) =>
  orders.map((order) =>
    order.id === id
      ? { ...order, items: [...order.items, item] }
      : order
  );
  //adding water to order 101
  const orderWithWater = addItem(orders, 101, {
  name: "Water",
  price: 500,
  qty: 1,
});

console.log(orderWithWater.find(({ id }) => id === 101).items);

//removeCancelled(orders)
//filter makes a new array that leaves out cancelled orders.
const removeCancelled = (orders) =>
  orders.filter(({ status }) => status !== "cancelled");

console.log(removeCancelled(orders).length);
// 7

//applyDiscount(orders, percent)
//Make new copies of every order, every items array, and every item.
//  The new item price is reduced by the given percentage. Math.round keeps the price a whole number.
const applyDiscount = (orders, percent) =>
  orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      price: Math.round(item.price * (1 - percent / 100)),
    })),
  }));
  //Try a 10% discount
  const discountedOrders = applyDiscount(orders, 10);
console.log(discountedOrders.find(({ id }) => id === 101).items);


//checking the original data
console.log(JSON.stringify(orders) === ORIGINAL);