Super Inventory Management
==========================

This is a system to manage the operations of an inventory that deals with storage and delivery of PC parts.
There are 4 types of users who can use this system:

S No.   USERNAME  PASSWORD    DETAILS
1.      purchase  purchase   member of purchase team
2.      sale      sale       member of sales team
3.      tech      tech       member of tech team
4.      ware1     ware1      warehouse manager of Tokyo warehouse
5.      ware2     ware2      warehouse manager of Shanghai warehouse
6.      ware3     ware3      warehouse manager of Singapore warehouse
7.      ware4     ware4      warehouse manager of Delhi warehouse

Here is a simple flow that explains tha working of the system:

1. Addition of an order to inventory:
	-> Purchase member adds order on new order page  
	-> After confirmation from sellers, order is approved 
	-> After getting information from sellers when the order is shipped, the status of order is set to shipped 
	-> Respective Warehouse manager is notified 
	-> On arrival of order, the status is set to complete and the products are added to inventory 
	-> The tech team checks the quality of all products and adds the defective products to defective list 
	-> Purchase team member is notified 
	-> He checks the details of order and contacts supplier to correct the same.

2. Removal of an order from repository:
	-> Sales member receives the order from customer and enters into the system 
	-> If there are products in warehouse that are less than the required quantity, a "Requirement order" is placed 
	-> The order is edited and only the available items are processed further. For requirements, a different order is placed by the purchase team 
	-> When the order is approved, the warehouse manager is notified
	-> The manager arranges the packing and delivery of the order and sets the status to "shipped"
	-> When the order is received by the customer, the order is set as received and the products are removed from the list.

3. Returns for sales orders
	-> Customer can file sales order
	-> After getting the information regarding the order, the sales person would select the order and set the quantity of the products to be returned.
	-> If the reason for return is defective products, then the suppliers are contacted
	-> If the return is filed because the customer doesn't need the products, then those products are added back to the warehouse from where they were taken.

4. Better planning of the operation schedule
	-> A calendar widget is displayed that shows different dates related to different users to help with their tasks and plan ahead for the same

5. Restocking between warehouses
 	-> In the end of every month, one can opt to re-arrange the stocks between different warehouses, based on their sales etc.
 	-> The purchase team member initiates the restocking.
 	-> The system provides suggestions based on excess and low stocks in different warehouses and suggest the quantity to be transferred.
 	-> If the member feels to change the quantity, that can be done too. Then the request is placed
 	-> All the managers from where products have to be shipped are notified. 
 	-> After shipping the goods from that warehouse, the products are removed from tha list of that warehouse
 	-> When the goods are received by the other warehouse, the respective manager sets the order to complete and the products are added to the list of that warehouse.

 Things added:
 -------------
 1. print order
 2. Analysis of previous stocks and suggestion of appropriate quantity of products to be bought
 3. better notifications
 4. calendar updates
 5. low stock alerts
 6. product page UI
 7. order update
 8. order cancellation