import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

const single = (S: Parameters<StructureResolver>[0], id: string, title: string) =>
  S.listItem().title(title).id(id).child(S.document().schemaType(id).documentId(id).title(title));

const orderList = (S: Parameters<StructureResolver>[0], id: string, title: string, filter: string) =>
  S.listItem()
    .title(title)
    .id(id)
    .child(
      S.documentList()
        .id(id)
        .title(title)
        .schemaType("pickupOrder")
        .filter(filter)
        .defaultOrdering([{ field: "createdAt", direction: "desc" }]),
    );

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Hamley's")
    .items([
      S.listItem()
        .title("Orders")
        .id("orders")
        .child(
          S.list()
            .title("Pickup orders")
            .items([
              orderList(S, "orders-new", "New", `_type == "pickupOrder" && status == "new"`),
              orderList(S, "orders-bagged", "Bagged, waiting for pickup", `_type == "pickupOrder" && status == "bagged"`),
              orderList(S, "orders-all", "All orders, newest first", `_type == "pickupOrder"`),
            ]),
        ),
      orderableDocumentListDeskItem({ type: "product", title: "Products", S, context, createIntent: true }),
      S.documentTypeListItem("teaCategory").title("Tea categories"),
      S.divider(),
      single(S, "homePage", "Home page"),
      single(S, "siteSettings", "Settings"),
      S.divider(),
      S.documentTypeListItem("post").title("Journal"),
    ]);
