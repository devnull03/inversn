# API Integration Guide

## Delhivery API Integration
7 Steps Of Integration
As per the business needs depending upon the scale and automation which one wants to achieve, classification among APIs are being done,i.e. Must To Have and Can Have

1. **Check the pin-code serviceability**: API to check whether the pin code for delivery address is serviceable or not.

2. **Warehouses / Pickup locations**: Pickup location are required to be created from where pickup has to be done. One time pickup location can also be created through Warehouse creation API.

3. **Pre - generated Waybill**: This API will help you fetch the waybill which a unique number required at Delhivery to identify the shipment.

4. **Package/order creation**: The soft data of the shipment needs to be pushed to Delhivery system via Order Creation API. While manifesting the order, waybill can be given in two-ways:

	(1) Fetching the waybill from the API and pre-fill it with order.

	(2) Leaving the waybill blank in order creation API and system will auto-generate the waybill during order creation.

5. **Shipping label**: The packing slip api provides all information required to be on the shipment packing slip and a client can design it as per the requirement.

6. **Create Pickup Request API**: Once the order has been created, pickup request to pick the shipment will be done through this API.

7. **Track Shipment**: Order created in the system can be tracked via tracking API. Waybill will be the required input for this API.

8. **Edit/cancel the order**: You can use edit/cancellation API, but you have to make sure that the order is in right state in order to be edited/cancelled.

9. **NDR API**: To schedule deferred delivery/re-attempt or edit details like name,address,phone number from client side.

## Square 

1. 