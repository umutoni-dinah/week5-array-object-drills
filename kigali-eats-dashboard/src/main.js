import { orders } from "./data.js";
import {
  averageRating,
  bestSellingItem,
  deliveredOrders,
  orderTotal,
  revenueByDistrict,
} from "./helpers.js";
import "./style.css";

const app = document.querySelector("#app");

const completedOrders = deliveredOrders(orders);

const totalRevenue = completedOrders.reduce(
  (sum, order) => sum + orderTotal(order),
  0
);

const rating = averageRating(orders);
const favouriteItem = bestSellingItem(orders);

const districtRevenue = revenueByDistrict(orders);
const maxRevenue = Math.max(...Object.values(districtRevenue));

const money = (amount) => `RWF ${amount.toLocaleString()}`;

app.innerHTML = `
  <main class="min-h-screen bg-rose-50 px-5 py-10 text-stone-900">
    <div class="mx-auto max-w-6xl">
      <p class="text-sm font-bold uppercase tracking-widest text-lime-700">
        Kigali Eats · Operations
      </p>

      <h1 class="mt-2 text-3xl font-bold">
        Orders dashboard
      </h1>

      <section class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-stone-500">Total revenue</p>
          <p class="mt-3 text-2xl font-bold">${money(totalRevenue)}</p>
          <p class="mt-1 text-xs text-stone-500">Delivered orders</p>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-stone-500">Delivered orders</p>
          <p class="mt-3 text-2xl font-bold">${completedOrders.length}</p>
          <p class="mt-1 text-xs text-stone-500">Successfully completed</p>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-stone-500">Average rating</p>
          <p class="mt-3 text-2xl font-bold">${rating} / 5</p>
          <p class="mt-1 text-xs text-stone-500">Across rated orders</p>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-stone-500">Best-selling item</p>
          <p class="mt-3 text-2xl font-bold">${favouriteItem.name}</p>
          <p class="mt-1 text-xs text-stone-500">
            ${favouriteItem.qty} portions ordered
          </p>
        </article>
      </section>
      <section class="mt-6 rounded-2xl bg-white p-6 shadow-sm">
  <h2 class="text-lg font-bold">Revenue by district</h2>
  <p class="mt-1 text-sm text-stone-500">Delivered orders only</p>

  <div class="mt-6 space-y-5">
    ${Object.entries(districtRevenue).map(([district, revenue]) => {
      const width = (revenue / maxRevenue) * 100;

      return `
        <div class="grid grid-cols-[7rem_1fr_6rem] items-center gap-3">
          <span class="text-sm text-stone-600">${district}</span>

          <div class="h-3 overflow-hidden rounded-full bg-stone-100">
            <div
              class="h-full rounded-full bg-pink-400"
              style="width: ${width}%"
            ></div>
          </div>

          <span class="text-right text-sm font-medium">
            RWF ${revenue.toLocaleString()}
          </span>
        </div>
      `;
    }).join("")}
  </div>
</section>
<section class="mt-6 rounded-2xl bg-white p-6 shadow-sm">
  <h2 class="text-lg font-bold">Orders</h2>

  <div class="mt-4 flex flex-wrap gap-2">
    <button data-filter="all" class="rounded-full bg-pink-600 px-4 py-2 text-sm text-white">
      All
    </button>

    <button data-filter="delivered" class="rounded-full bg-stone-100 px-4 py-2 text-sm">
      Delivered
    </button>

    <button data-filter="pending" class="rounded-full bg-stone-100 px-4 py-2 text-sm">
      Pending
    </button>

    <button data-filter="cancelled" class="rounded-full bg-stone-100 px-4 py-2 text-sm">
      Cancelled
    </button>
  </div>

  <div class="mt-5 overflow-x-auto">
    <table class="w-full min-w-[600px] text-left text-sm">
      <thead>
        <tr class="text-xs uppercase text-stone-400">
          <th class="px-4 py-3">ID</th>
          <th class="px-4 py-3">Customer</th>
          <th class="px-4 py-3">District</th>
          <th class="px-4 py-3 text-right">Total</th>
          <th class="px-4 py-3 text-right">Status</th>
        </tr>
      </thead>

      <tbody id="orders-body"></tbody>
    </table>
  </div>
</section>
    </div>
  </main>
`;
let activeFilter = "all";

const statusClasses = {
  delivered: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const renderOrders = () => {
  const visibleOrders =
    activeFilter === "all"
      ? orders
      : orders.filter(({ status }) => status === activeFilter);

  // This is our own local assignment data, so innerHTML is acceptable here.
  const rows = visibleOrders
    .map((order) => `
      <tr class="border-t border-stone-100">
        <td class="px-4 py-3 font-semibold">#${order.id}</td>
        <td class="px-4 py-3">${order.customer.name}</td>
        <td class="px-4 py-3 text-stone-500">${order.customer.district}</td>
        <td class="px-4 py-3 text-right font-medium">
          RWF ${orderTotal(order).toLocaleString()}
        </td>
        <td class="px-4 py-3 text-right">
          <span class="rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses[order.status]}">
            ${order.status}
          </span>
        </td>
      </tr>
    `)
    .join("");

  document.querySelector("#orders-body").innerHTML = rows;

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.className =
      button.dataset.filter === activeFilter
        ? "rounded-full bg-pink-600 px-4 py-2 text-sm text-white"
        : "rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700";

    button.onclick = () => {
      activeFilter = button.dataset.filter;
      renderOrders();
    };
  });
};

renderOrders();