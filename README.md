<div align="center">
  <img src="https://github.com/manparvesh/SIM/raw/master/screenshot.png">
</div>
<div align="center">

  <p>This is a system to manage the operations of an inventory that deals with storage and delivery of PC parts.</p>
  <a href="https://manparvesh.mit-license.org/"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a> 
</div>

## Users
There are 4 types of users who can use this system:

| S No.  | USERNAME | PASSWORD  |  DETAILS |
|---|---|---|---|
|1.     | purchase | purchase  | member of purchase team|
|2.     | sale     | sale      | member of sales team|
|3.     | tech     | tech      | member of tech team|
|4.     | ware1    | ware1     | warehouse manager of Tokyo warehouse|
|5.     | ware2    | ware2     | warehouse manager of Shanghai warehouse|
|6.     | ware3    | ware3     | warehouse manager of Singapore warehouse|
|7.     | ware4    | ware4     | warehouse manager of Delhi warehouse|

## Features

1. Addition of products to inventory:
	- Purchase member adds order on new order page  
	- After confirmation from sellers, order is approved or updated acordingly.
	- After getting information from sellers when the order is shipped, the status of order is set to shipped 
	- Respective Warehouse manager is notified 
	- On arrival of order, the status is set to complete and the products are added to inventory
	- He/she can print the details of order and can give the details to workers / tech team. 
	- The tech team checks the quality of all products and adds the defective products to defective list 
	- Purchase team member is notified 
	- He checks the details of order and contacts supplier to correct the same.
	- The order can be cancelled before it is completed at any time.

2. Removal of products from inventory:
	- Sales member receives the order from customer and enters into the system 
	- If there are products in warehouse that are less than the required quantity, a "Requirement order" is placed. 
	- The order is edited and only the available items are processed further. For requirements, a different order is placed by the purchase team and when the requirement order is completed, another sales order is created to meet the original needs of the customer.
	- When the order is approved, the warehouse manager is notified
	- The manager arranges the packing and delivery of the order and sets the status to "shipped"
	- When the order is received by the customer, the order is set as received and the products are removed from the list.

3. Returns for sales orders
	- Customer can file sales order
	- After getting the information regarding the order, the sales person would select the order and set the quantity of the products to be returned.
	- If the reason for return is defective products, then the suppliers are contacted
	- If the return is filed because the customer doesn't need the products, then those products are added back to the warehouse from where they were taken.

4. Better planning of the operation schedule
	- A calendar widget is displayed that shows different dates related to different users to help with their tasks and plan ahead for the same
	- A warehosue manager can see if there are any orders that are planned to be sent or received and their estimated dates so that they can be on time. They can also check if any orders are late.

5. Restocking between warehouses
 	- In the end of every month, one can opt to re-arrange the stocks between different warehouses, based on their sales etc.
 	- The purchase team member initiates the restocking.
 	- The system provides suggestions based on excess and low stocks in different warehouses and suggest the quantity to be transferred.
 	- If the member feels to change the quantity, that can be done too. Then the request is placed
 	- All the managers from where products have to be shipped are notified. 
 	- After shipping the goods from that warehouse, the products are removed from tha list of that warehouse
 	- When the goods are received by the other warehouse, the respective manager sets the order to complete and the products are added to the list of that warehouse.

6. Low stock alerts
	- The system uses linear regression to estimate the optimal amount of each product that should be there in the warehouse, depending on previous sales and purchases.
	- Purchase team is notified of the products that are low in stock and by just clicking a button, they can place a purchase order with the required amount of products to be placed.

7. Dashboard: 
	- The dashboard contains all the information required for a user to work on, depending on their respective user operations.  
	- Appropriate alerts are also displayed to get them started for work. 
