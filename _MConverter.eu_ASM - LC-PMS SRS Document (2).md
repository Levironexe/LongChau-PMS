**Swinburne University of Technology **

***School of Software and Electrical Engineering ***

**ASSIGNMENT AND PROJECT COVER SHEET **

****

Subject Code: SWE30003 





Unit Title: Software Architectures and Design 

Assignment number and title: 2, Object Design Due date: 11:59pm, 6th Jul 2025 

Tutorial Day and time: 





Project Group: Group 1 

Tutor: Dr. Pham Thai Ky Trung 

****

**To be completed as this is a group assignment **

We declare that this is a group assignment and that no part of this submission has been copied from any other student's work or from any other source except where due acknowledgment is made explicitly in the text, nor has any part been written for us by another person. 





Total Mark: 



**Extension certification: **

This assignment has been given an extension and is now due on Signature of Convener: ** **

****

****

****





****

*** ***

**** 

**SWE30003 **

**SOFTWARE ARCHITECTURES AND DESIGN **

**OBJECT DESIGN **

**ASSIGNMENT 2 **



**Team Members **

Arlene Phuong Brown - SWS00743 

****

Le Hoang Long - SWS01138 

****

****

Nguyen Ngoc Anh - SWS00627 

****

Nguyen Thien Phuoc -SWS00802 

****



**Tutor/Lecturer:** Dr. Ky Trung Pham 

**Submission date:** 07/07/2025 **Word count: **7708** **

2 



**Table of Content **

****

**Executive Summary........................................................................................................5**** **

**1. Introduction.................................................................................................................5**** **

1.1. Outlook of Solution............................................................................................... 5 

1.2. Trade-offs and Design Decisions......................................................................................6 

1.3. Definitions, Acronyms, and Abbreviation.......................................................................... 6 

**2. Problem Analysis........................................................................................................8**** **

2.1. Goals.................................................................................................................... 8 

2.2. Assumptions.........................................................................................................8 

2.3. Simplifications...................................................................................................... 9 

**3. Candidate Classes......................................................................................................9**** **

3.1. Candidate Class List.......................................................................................... 10 

3.2. UML Diagram..................................................................................................... 12 

3.3. CRC Cards......................................................................................................... 13 

3.3.1. Abstract Classes.................................................................................................... 13 

3.3.2. Interface................................................................................................................. 15 

3.3.3. Concrete Domain Classes..................................................................................... 16 

3.3.4. Data-Holder Classes..............................................................................................31 

3.4. Class Selection Justification...............................................................................34 

**4. Design Quality...........................................................................................................35**** **

4.1 Design Heuristics................................................................................................ 35 

4.1.1. Single Responsibility Principle............................................................................... 35 

4.1.2. Information Hiding..................................................................................................36 

4.1.3. Consistent Interface Design...................................................................................37 

4.1.4. Error Handling........................................................................................................38 

4.1.5. Scalability Considerations......................................................................................39 

4.1.6. Security by Design................................................................................................. 40 

4.1.7. Maintainability........................................................................................................ 41 

4.2. Design Principles Applied............................................................................................... 42 

4.2.1. SOLID Principles:...................................................................................................42 

4.2.2. Additional OOP Principles:.....................................................................................43 

**5. Design Patterns Applications...............................................................................................43**** **

5.1. Creational Patterns.............................................................................................43 

5.1.1. Factory Method Pattern......................................................................................... 43 

5.2. Structural Patterns..............................................................................................47 

5.2.1. Adapter Pattern......................................................................................................47 

5.2.2. Facade Pattern...................................................................................................... 49 

5.3. Behavioral Patterns............................................................................................ 51 

3 



5.3.1. Observer Pattern....................................................................................................51 

5.3.2. State Pattern.......................................................................................................... 55 

5.3.3. Strategy Pattern..................................................................................................... 58 

**6. Bootstrap Process....................................................................................................62**** **

**7. Verification................................................................................................................ 64**** **

7.1. Customer Places Order with Prescriptions.........................................................65 

7.2. Inventory Reorder Processing............................................................................66 

7.3. Multi-Branch Stock Transfer............................................................................... 67 

7.4. Prescription Processing and Approval............................................................... 68 

7.5. Online Order with Delivery..............................................................................................70 

7.6. Staff Generates Order Report.........................................................................................71 

7.7. Loyalty Points After Payment..........................................................................................72 

**8. References................................................................................................................ 73**** **

****

4 



**Executive Summary **

The Long Chau Pharmacy Management System \(LC-PMS\) has been designed to modernize and centralize Long Chau's pharmacy operations across its multiple branches. This object design document aims to present a comprehensive solution that transforms manual and disconnected systems into an integrated digital platform which supports both in-store and online customer interactions, real-time inventory management, prescription processing and analytics capabilities. 

The proposed solution employs object-oriented design principles to create a scalable, maintainable system that addresses current operational inefficiencies whilst providing a foundation for future expansion and integration with external services. 





**1. Introduction **

Within this Object Design Document, we aim to break down the detailed class structure, interactions and design patterns for the Long Chau Pharmacy Management System. 

This document acts as a blueprint for developers and stakeholders, it defines the system's architecture and shows how the various components work together to deliver comprehensive pharmacy management functionality. Our goal is to provide a clear understanding of how everything fits and work together in the system. 

**1.1. Outlook of Solution **

The LC-PMS solution is built on a layered architecture with a clear separation of concerns. The system utilizes design patterns such as the Factory Method for object creation, Strategy pattern for payment processing and MVC for the user interface management. The database layer provides persistent storage while the business logic layer handles core pharmacy operations which includes inventory management, prescription processing, order fulfillment and reporting. 

5 



**1.2. Trade-offs and Design Decisions **

**Naming Convention:** Classes use descriptive PascalCase naming \(e.g., PharmacyBranch, PrescriptionProcessor\) to enhance readability and maintain consistency across the codebase. 

**Error Handling:** The system implements comprehensive exception handling with specific exceptions for prescription validation, inventory shortages, and payment processing failures. 

**Security Considerations:** Sensitive operations such as prescription access and payment processing are protected through role-based access control and secure authentication mechanisms. 



**1.3. Definitions, Acronyms, and Abbreviation **

**No. **

**Term **

**Acronym **

**Definition **

**1 **

**Customer **

**C **

End users 

**Frontend **

User interface accessed via mobile app 

**2 **

**FE **

**\(Mobile/Web\) **

or website 

**Prescription **

Component that manages prescription 

**3 **

**PP **

**Processor **

submission, validation, and assignment 

Medical professional validating and 

**4 **

**Pharmacist **

**PH **

approving prescriptions 

**Inventory **

Service that monitors and manages stock 

**5 **

**IM **

**Manager **

levels across branches 

6 



Core backend orchestrating processes 

**6 **

**System **

**SYS **

across modules 

External vendor providing ordered 

**7 **

**Supplier **

**SUP **

medicines or products 

**Notification **

Module responsible for sending alerts 

**8 **

**NS **

**Service **

and confirmations 

**Inventory **

Records and updates inventory 

**9 **

**IT **

**Transaction **

movements and adjustments 

Authorized person who approves 

**10 **

**Branch Manager **

**BM **

inter-branch stock transfers 

On-site staff identifying shortages and 

**11 **

**Branch Staff **

**BS **

initiating transfers 

Branch receiving stock from another 

**12 **

**Receiving Branch **

**RB **

location 

Service handling physical transfer of 

**13 **

**Delivery Service **

**DS **

goods between branches 

**Payment **

Handles customer payments and 

**14 **

**PM **

**Processor **

transaction confirmation 

**Prescription **

Logs approved prescriptions for audit 

**15 **

**PR **

**Record **

and compliance tracking 

Represents a delivery method such as 

**16 **

**Delivery **

**DL **

pickup or home delivery 

System user with role-based access, 

**17 **

**Staff **

**ST **

such as pharmacist or branch manager 

7 



Points awarded to customers after 

**18 **

**Loyalty Point **

**LP **

purchases, used for rewards or discounts 

Interface representing payment type like 

**19 **

**Payment Method **

**PM **

digital, cash, or credit 





Table 1: Table of Definitions, Acronyms, and Abbreviation **2. Problem Analysis **

**2.1. Goals **

The LC-PMS wants to update Long Chau's pharmacy activities by integrating prescription management, stock management, and customer persistence across branches. The system must conform to Vietnamese medicines regulations, be able to work in store and online and offer real-time visibility of medicine stock levels. 

**2.2. Assumptions **

**A1. ** All Long Chau branches have reliable internet connectivity for real-time inventory synchronization across 1,600\+ locations 

**A2. ** Licensed pharmacists are available during all operating hours to validate prescriptions as required by Vietnamese regulations 

**A3. ** Staff have basic computer literacy skills to operate the new digital system **A4. ** Existing POS systems can be integrated with LC-PMS through standard APIs **A5. ** Vietnamese healthcare regulations for digital prescriptions will remain stable during implementation 

**A6. ** Customers have access to smartphones with internet connectivity for mobile app usage 

8 



**A7. ** Payment gateway providers \(VNPay, MoMo, ZaloPay\) maintain stable services for transaction processing 

**A8. ** Third-party delivery partners \(GiaoHangNhanh, AhaMove\) will provide integration compatibility 

**A9. ** Peak system load will not exceed 350,000 concurrent customers and 5,000 

concurrent staff 

**A10. ** Customer data from existing branch systems can be migrated without significant data loss 

**A11. ** Long Chau will continue expansion plans with 500\+ new stores in 2025 

**A12. ** Emergency backup systems can maintain core operations for up to 2 hours during outages 

**A13. ** Prescription records must be retained for minimum 5 years per Vietnamese pharmaceutical regulations 

**2.3. Simplifications **

To reduce the initial system complexity, certain features have been simplified. Loyalty programs will follow a basic point-based model without tiered levels or complex discount rules. External delivery and logistics are abstracted into service classes and not modeled in detail. Multi-currency handling and international orders are not supported in this version. These simplifications help us stay focused on the core needs while leaving room for future expansion. 





**3. Candidate Classes **

Full list of candidate classes contained in the design solution UML-type class diagram \(or similar notation\) highlighting the relationships between the candidate classes to deduct up to 5 marks if full method signatures \(or thelike\) are used. Must include a brief 9 



justification of the chosen classes and why other candidate classes were discarded \(if applicable\) Up to 15 marks for classes and overview; 5 marks for justification. 

The detailed explanation of the classes’ purposes and relationships will be explained in section 3.3. CRC Cards. 

**3.1. Candidate Class List **

This section outlines the core class structure for the LC-PMS, categorizing 38 entities into abstract classes \(Staff, Order, Delivery, Product\), one interface \(PaymentMethod\), Data-Holder classes, and concrete domain classes representing real pharmacy entities. 

This object-oriented design ensures proper inheritance hierarchies and code reusability while modeling authentic pharmacy operations from staff management to product handling. Detailed information of each entity will be explained in section **3.3. CRC **

**Cards**. 

**Abstract Classes \(4 entities\): **

1. Staff 

2. Order 

3. Delivery 

4. Product 

**Interface \(1 entity\): **

1. PaymentMethod 

**Concrete Classes \(28 entities\): **

1. PharmacyBranch 

2. Customer 

3. VIPCustomer 

4. Pharmacist 

5. PharmacyTechnician 

6. BranchManager 

10 



7. Cashier 

8. Medicine 

9. PrescriptionMedicine 

10. OverTheCounterMedicine 

11. HealthSupplement 

12. MedicalDevice 

13. Prescription 

14. PrescriptionItem 

15. OrderItem 

16. PrescriptionOrder 

17. InStoreOrder 

18. OnlineOrder 

19. PickupDelivery 

20. HomeDelivery 

21. DigitalPayment 

22. CashPayment 

23. CreditCardPayment 

24. InventoryManager 

25. ReportGenerator 

26. PaymentMethodFactory 

27. ProductFactory 

28. LoyaltyPoint 

**Data-Holder Classes \(5 entities\): **

1. CustomerProfile 

2. BranchConfiguration 

3. InventoryRecord 

4. InventoryTransaction 

5. MedicineDatabase** **

11 





**3.2. UML Diagram **

This following UML class diagram illustrates the comprehensive object-oriented design for the Long Chau Pharmacy Management System, showing **38 interconnected** **entities** including abstract classes \(Staff, Order, Delivery, Product\), one interface \(PaymentMethod\), concrete domain classes, and data-holder classes. The diagram demonstrates proper inheritance hierarchies, design patterns \(Factory, Strategy\), and relationships between core pharmacy components such as staff management, product inventory, order processing, prescription handling, and payment systems. 





**Figure 1:** UML Class Diagram for Long Chau Pharmacy Management System 



****

**Relationship connectors **

**What it means **



Association \(uses/knows-about relationship\) 

12 





Inheritance \(IS-A relationship\) 



Realization/Implementation \(CAN-DO relationship\) 



Dependency \(uses-temporarily relationship\) 



Composition \(OWNS-A, part-of relationship\) 



Aggregation \(HAS-A, contains relationship\) 



**Table 2:** UML Legend Notation 



**3.3. CRC Cards **

**3.3.1. Abstract Classes **

**Staff **

Class Name: Staff 

Super Class: - 

**Description: **Abstract base class representing all pharmacy employees with common attributes and behaviors. Cannot be instantiated directly. 

**Responsibilities **

**Collaborators** 

Maintains employee personal information - 

Handles authentication and login 

- 

Tracks work schedule and attendance 

- 

Provides common staff operation 

PharmacyBranch 

**Table 3:** Abstract Class of Staff 

13 



**Order **

Class Name: Order 

Super Class: - 

**Description: **Abstract base class for all customer orders, containing common order processing logic while requiring specific implementations for different order types. 

**Responsibilities **

**Collaborators** 

Manages order items and quantities 

OrderItem 

Calculates total cost including discounts 

PaymentMethod 

Tracks order status and workflow 

Customer 

Coordinates with inventory system 

InventoryManager 

Schedule delivery arrangement 

Delivery 

**Table 4:** Abstract Class of Order 

****

**Delivery **

Class Name: Delivery 

Super Class: - 

**Description: **Abstract base class for delivery services, defining common delivery tracking and management functionality while allowing specific delivery method implementations. 

**Responsibilities **

**Collaborators** 

Tracks delivery status and progress 

Order 

Manages delivery scheduling 

Customer 

14 



Coordinates with delivery personnel 

- 

Updates delivery notifications 

- 

**Table 5:** Abstract Class of Delivery 



**Product **

Class Name: Product 

Super Class: - 

**Description: **Abstract base class for all sellable items in the pharmacy, providing common product attributes and behaviors while requiring specific implementations for different product types. 

**Responsibilities **

**Collaborators** 

Stores basic product information 

- 

Manages pricing and cost calculations 

- 

Handles inventory tracking 

InventoryManager 

Provides product categorization 

- 

**Table 6:** Abstract Class of Staff 



**3.3.2. Interface **

**PaymentMethod **

Class Name: PaymentMethod 

Super Class: - 

15 



**Description: **Interface defining the contract for all payment processing methods, ensuring consistent payment handling across different payment types. 

**Responsibilities **

**Collaborators** 

Defines payment processing contract 

- 

Ensures payment validation standards 

- 

Provides transaction status interface 

- 

Handles payment confirmation protocols 

Order 

**Table 7:** Interface of PaymentMethod 

**3.3.3. Concrete Domain Classes **

**PharmacyBranch **

Class Name: **PharmacyBranch** 

Super Class: - 

**Description: **Represents a physical Long Chau pharmacy location with its specific inventory, staff, and operational data. 

**Responsibilities **

**Collaborators** 

Manages branch-specific inventory 

InventoryManager, Product 

Coordinates staff assignment 

Staff, BranchManager 

Processes local orders 

Order, Customer 

Reports branch performance 

ReportGenerator 

Maintains branch operating hours 

BranchConfiguraiton 

**Table 8:** Concrete Domain Classes of PharmacyBranch 16 



**Customer **

Class Name: Customer 

Super Class: - 

**Description: **Represents a pharmacy customer with personal information, order history, and account preferences. 

**Responsibilities **

**Collaborators** 

Maintains personal profile information 

CustomerProfile 

Places orders for products 

Order, Product 

manages prescription uploads 

Prescription 

Handles payment preferences 

PaymentMethod 

Tracks order and delivery status 

Delivery 

**Table 9:** Concrete Domain Classes of Customer 

**VIPCustomer **

Class Name: VIPCustomer 

Super Class: Customer 

**Description: **Special customer type with enhanced benefits, loyalty rewards, and priority service features. 

**Responsibilities **

**Collaborators** 

Manages VIP-specific benefits 

LoyaltyPoint 

Accesses priority services 

Order 

Handles advanced loyalty features 

Customer 

17 



Receives exclusive notification 

- 

**Table 10:** Concrete Domain Classes of VIPCustomer 

**Staff **

Class Name: Pharmacist 

Super Class: Staff 

**Description: **Licensed pharmacy professional responsible for prescription validation, medication counseling, and pharmaceutical oversight. 

**Responsibilities **

**Collaborators** 

Validates prescription authenticity 

Prescription 

Checks medicine interactions 

Medicine, MedicineDatabase 

Provides medication counseling 

Customer 

Ensures regulatory compliance 

- 

Supervises pharmacy operations 

PharmacyTechnician 

**Table 11:** Concrete Domain Class of Staff 

**PharmacyTechnician **

Class Name: PharmacyTechnician 

Super Class: Staff 

**Description: **Support staff assisting pharmacists with prescription preparation, inventory management, and customer service. 

**Responsibilities **

**Collaborators** 

Assists with prescription preparation 

Prescription, Pharmacist 

18 



Manages inventory restocking 

InventoryManager 

Handles basic customer inquiries 

Customer 

Processes routine transactions 

Order 

**Table 12:** Concrete Domain Class of PharmacyTechnician **BranchManager **

Class Name: BranchManager 

Super Class: Staff 

**Description: **Senior staff member responsible for overall branch operations, staff management, and performance oversight. 

**Responsibilities **

**Collaborators** 

Manages branch operations 

PharmacyBranch 

Supervices all branch staff 

Staff 

Reviews performance reports 

ReportGenerator 

handles escalated issues 

Customer 

Coordinates with corporate 

- 

**Table 13:** Concrete Domain Class of BranchManager 

**Cashier **

Class Name: Cashier 

Super Class: Staff 

**Description: **Front-desk staff responsible for processing payments, handling transactions, and basic customer service. 

19 



**Responsibilities **

**Collaborators** 

Processes customer payments 

PaymentMethod 

Handles transaction completion 

Order 

Manages cash register operations 

- 

Provides basic customer service 

Customer 

**Table 14:** Concrete Domain Class of Cashier 

**Medicine **

Class Name: Medicine 

Super Class: Product 

**Description: **Pharmaceutical product with specific medical properties, dosage information, and regulatory requirements. 

**Responsibilities **

**Collaborators** 

Stores medicine-specific information 

MedicineDatabase 

Validates prescription requirements 

Prescription 

Manages dosage and interaction data 

Pharmacist 

Handles expiry date tracking 

InventoryManager 

Enforces dispensing regulations 

- 

**Table 15:** Concrete Domain Class of Medicine 

**PrescriptionMedicine **

Class Name: Prescription Medicine 

Super Class: Medicine 

20 



**Description: **Controlled medication requiring valid prescription and pharmacist approval before dispensing. 

**Responsibilities **

**Collaborators** 

Enforces prescription requirements 

Prescription, Pharmacist 

Validates prescription authenticity 

- 

Manages controlled substance tracking 

- 

Handles special storage requirements 

InventoryManager 

**Table 16:** Concrete Domain Class of PrescriptionMedicine **OverTheCounterMedicine **

Class Name: OverTheCounterMedicine 

Super Class: Medicine 

**Description: **Non-prescription medication available for direct purchase without pharmacist approval. 

**Responsibilities **

**Collaborators** 

Provides self-service availability 

Product 

Allows direct customer purchase 

Customer, Order 

Handles basic safety warnings 

- 

Manages standard inventory 

InventoryManager 

**Table 17:** Concrete Domain Class of OverTheCounterMedicine **HealthSupplement **

Class Name: HealthSupplement 

21 



Super Class: Product 

**Description: **Nutritional supplement product including vitamins, minerals, and health enhancement items. 

**Responsibilities **

**Collaborators** 

Manages supplement information 

- 

Handles nutritional data 

- 

Processes direct sales 

Order, Customer 

Maintains supplement inventory 

InventoryManager 

**Table 18:** Concrete Domain Class of HealthSupplement **MedicalDevice **

Class Name: MedicalDevice 

Super Class: Product 

**Description: **Medical equipment and devices such as thermometers, blood pressure monitors, and diagnostic tools. 

**Responsibilities **

**Collaborators** 

Manages device specifications 

- 

Handles warranty information 

Customer 

Provides usage instructions 

Customer 

Maintains device inventory 

InventoryManager 

**Table 19:** Concrete Domain Class of MedicalDevice 

**Prescription **

22 



Class Name: Prescription 

Super Class: - 

**Description: **Medical prescription document containing patient information, medication details, and doctor's instructions. 

**Responsibilities **

**Collaborators** 

Stores prescription details 

PrescriptionItem 

Maintains patient information 

Customer 

Tracks prescription status 

Pharmacist 

Handles doctor verification 

- 

Manages prescription history 

- 

**Table 20:** Concrete Domain Class of Prescription 

**PrescriptionItem **

Class Name: PrescriptionItem 

Super Class: - 

**Description: **Individual medication entry within a prescription, specifying medicine, dosage, quantity, and administration instructions. 

**Responsibilities **

**Collaborators** 

Specifies medicine details 

Medicine 

Defines dosage instructions 

Prescription 

Manages quantity requirement 

- 

Handles administration guidelines 

Pharmacist 

**Table 21:** Concrete Domain Class of PrescriptionItem 23 



**OrderItem **

Class Name: OrderItem 

Super Class: - 

**Description:** Individual product entry within a customer order, containing product reference, quantity, and pricing information. 

**Responsibilities **

**Collaborators** 

References specific product 

Product 

Manages item quantity 

Order 

Calculates item subtotal 

- 

handles product customization 

- 

**Table 22:** Concrete Domain Class of OrderItem 

**PrescriptionOrder **

Class Name: PrescriptionOrder 

Super Class: Order 

**Description: **Specialized order type for prescription medications requiring pharmacist validation and approval. 

**Responsibilities **

**Collaborators** 

Links to prescription document 

Prescription 

Requires pharmacist approval 

Pharmacist 

Handles prescription validation 

- 

Manages controlled substance orders 

PrescriptionMedicine 

**Table 23:** Concrete Domain Class of PrescriptionOrder 24 



**InStoreOrder **

Class Name: InStoreOrder 

Super Class: Order 

**Description: **Order placed and fulfilled at the physical pharmacy location with immediate pickup. 

**Responsibilities **

**Collaborators** 

Handles immediate fulfillment 

PharmacyBranch 

Manages in-store pickup 

PickUpDelivery 

Processes walk-in customers 

Customer, Cashier 

Coordinates with branch staff 

Staff 

**Table 24:** Concrete Domain Class of InStoreOrder 

**OnlineOrder **

Class Name: OnlineOrder 

Super Class: Order 

**Description: **Order placed through digital channels requiring home delivery or scheduled pickup. 

**Responsibilities **

**Collaborators** 

Manages online order processing 

Customer 

Coordinates home delivery 

HomeDelivery 

Handles digital payments 

PaymentMethod 

Provides order tracking 

- 

**Table 25:** Concrete Domain Class of OnlineOrder 

25 



**PickUpDelivery **

Class Name: PickUpDelivery 

Super Class: Delivery 

**Description: **Delivery method where customers collect orders directly from the pharmacy branch location 

**Responsibilities **

**Collaborators** 

Schedules pickup appointments 

Customer 

Manages pickup notifications 

- 

Coordinates with branch staff 

PharmacyBranch 

Handles pickup verification 

Order 

**Table 26:** Concrete Domain Class of PickUpDelivery 

**HomeDelivery **

Class Name: HomeDelivery 

Super Class: Delivery 

**Description: **Delivery service that brings orders directly to customer's specified address. 

**Responsibilities **

**Collaborators** 

Manages delivery routing 

Customer 

Coordinates with delivery drivers 

- 

Tracks delivery progress 

- 

handles delivery confirmation 

Order 

**Table 27:** Concrete Domain Class of HomeDelivery 

26 



**DigitalPayment **

Class Name: DigitalPayment 

Super Class: - \(Implements PaymentMethod - interface\) 

**Description: **Electronic payment processing for digital wallets, mobile payments, and online banking. 

**Responsibilities **

**Collaborators** 

Processes digital transactions 

- 

Validates digital credentials 

- 

handles online security 

- 

Manages digital receipts 

PharmacyBranch 

**Table 28:** Concrete Domain Class of DigitalPayment 

**CashPayment **

Class Name: CashPayment 

Super Class: - \(Implements PaymentMethod - interface\) 

**Description: **Traditional cash payment processing for in-store transactions. 

**Responsibilities **

**Collaborators** 

Handles cash transactions 

Cashier 

Manages change calculation 

- 

Processes cash receipts 

Order 

Handles cash register operations 

- 

**Table 29:** Concrete Domain Class of CashPayment 

27 



**CreditCardPayment **

Class Name: CreditCardPayment 

Super Class: - \(Implements PaymentMethod - interface\) 

**Description: **Credit and debit card payment processing with bank integration and security protocols. 

**Responsibilities **

**Collaborators** 

Processes card transactions 

- 

Validates card credentials 

- 

Handles bank communication 

- 

Manages card receipts 

Order 

**Table 30:** Concrete Domain Class of CreditCardPayment **InventoryManager **

Class Name: InventoryManager 

Super Class: - 

**Description: **Central service for managing stock levels, inventory tracking, and automated reordering across all pharmacy branches. 

**Responsibilities **

**Collaborators** 

Tracks real-time inventory levels 

Product, InventoryRecord 

Processes inventory transactions 

InventoryTransaction 

Manages automatic reordering 

- 

Coordinates inter-branch transfer 

PharmacyBranch 

28 



Handles expiry date management 

Medicine 

**Table 31:** Concrete Domain Class of InventoryManager **ReportGenerator **

Class Name: ReportGenerator 

Super Class: - 

**Description: **Service class responsible for generating various business reports, analytics, and performance metrics. 

**Responsibilities **

**Collaborators** 

Generates sales reports 

Order, Customer 

Creates inventory reports 

InventoryManager 

Produces staff performance reports 

Staff 

Handles financial reporting 

- 

Manages custom report requests 

BranchManager 

**Table 32:** Concrete Domain Class of ReportGenerator **PaymentMethodFactory **

Class Name: PaymentMethodFactory 

Super Class: - 

**Description: **Factory class for creating appropriate payment method instances based on customer selection and transaction type. 

**Responsibilities **

**Collaborators** 

Creates payment method instances 

PaymentMethod 

29 



Determines payment method selection 

Order 

handles payment method selection 

Customer 

Manages payment configuration 

- 

**Table 33:** Concrete Domain Class of PaymentMethodFactory **ProductFactory **

Class Name: ProductFactory 

Super Class: - 

**Description: **Factory class for creating different types of product instances based on product categories and specifications. 

**Responsibilities **

**Collaborators** 

Creates product instances 

Product 

Determines product type 

- 

Handles product categorization 

- 

Manages product creation rules 

InventoryManager 

**Table 34:** Concrete Domain Class of ProductFactory 

**LoyaltyPoint **

Class Name: LoyaltyPoint 

Super Class: - 

**Description: **Service class managing customer loyalty program, points accumulation, and reward redemption. 

**Responsibilities **

**Collaborators** 

30 



Tracks customer points 

Customer, VIPCustomer 

Calculates point earnings 

Order 

Handles point redemption 

PaymentMethod 

Manages loyalty benefits 

- 

**Table 35:** Concrete Domain Class of LoyaltyPoint 

**3.3.4. Data-Holder Classes **

**CustomerProfile **

Class Name: CustomerProfile 

Super Class: - 

**Description: **Data container storing detailed customer information, preferences, and account settings. 

**Responsibilities **

**Collaborators** 

Stores personal information 

Customer 

Manages contact preferences 

- 

Handles address information 

Delivery 

Maintains medical history 

Prescription 

**Table 36:** Data-Holder Class of CustomerProfile 

**BranchConfiguration **

Class Name: BranchConfiguration 

Super Class: - 

**Description: **Configuration data holder for branch-specific settings, operating hours, 31 



and local policies. 

**Responsibilities **

**Collaborators** 

Stores branch settings 

PharmacyBranch 

Manages operating hours 

- 

Handles local configurations 

Staff 

Maintains branch policies 

BranchManager 

**Table 37:** Data-Holder Class of BranchConfiguration **InventoryRecord **

Class Name: InventoryRecord 

Super Class: - 

**Description: **Data record storing inventory information for specific products at specific branch locations. 

**Responsibilities **

**Collaborators** 

Tracks stock quantities 

Product 

Records inventory changes 

InventoryTransaction 

Maintains location data 

PharmacyBranch 

Stores reorder information 

InventoryManager 

**Table 38:** Data-Holder Class of InventoryRecord 

**InventoryTransaction **

Class Name: InventoryTransaction 

Super Class: - 

32 



**Description: **Transaction record documenting all inventory movements, including receipts, sales, transfers, and adjustments. 

**Responsibilities **

**Collaborators** 

Records transaction details 

InventoryManager 

Tracks products movements 

Product 

Maintains transaction history 

Staff 

Handles audit trail 

- 

**Table 39:** Data-Holder Class of InventoryTransaction **MedicineDatabase **

Class Name: MedicineDatabse 

Super Class: - 

**Description: **Comprehensive database containing detailed medicine information, interactions, contraindications, and regulatory data. 

**Responsibilities **

**Collaborators** 

Stores medicine information 

Medicine 

Provides interaction data 

Pharmacist 

Maintains regulatory compliance 

- 

Handles medicine lookup 

- 

**Table 40:** Data-Holder Class of MedicineDatabase 

33 



**3.4. Class Selection Justification **

We selected these 38 classes in order to comprehensively model Long Chau pharmacy operations while still maintaining a clear separation of concerns. The design follows Domain-Driven Design principles which organizes the classes into logical categories: abstract base classes for extensibility, concrete domain entities for business logic, service classes for operations and data-holder classes for information management. 



We chose abstract classes \(Staff, Order, Product, Delivery\) to provide extensible hierarchies which allows future pharmacy roles and order types. The PaymentMethod interface enables the Strategy pattern for flexible payment processing. The Factory classes \(ProductFactory, PaymentMethodFactory\) encapsulates complex object creation logic. Service classes like InventoryManager and ReportGenerator handle cross-cutting concerns without violating the single responsibility principle. 



We considered but rejected alternatives such as: a single 'User' class \(insufficient role separation\), combining all products into one class \(violates Open/Closed principle\) and using inheritance for payment methods instead of interface \(prevents multiple payment strategies\). Our final design balances comprehensiveness with maintainability. 





**4. Design Quality **

**4.1 Design Heuristics **

**4.1.1. Single Responsibility Principle **

**Principle:** Each class should have one reason to change and one primary responsibility. 

**Implementation in LC-PMS: **

34 



- **Pharmacist class**: Exclusively handles prescription validation, medication counseling and pharmaceutical oversight as defined in our CRC cards 

- **InventoryManager:** Is solely responsible for tracking real-time inventory levels, processing inventory transactions and managing automatic reordering 

- **LoyaltyPoint:** Exclusively handles the customer points tracking, point earnings calculation, point redemption and loyalty benefits management 

- **ReportGenerator:** Dedicated to generating sales reports, inventory reports and staff performance reports 

**Benefits for Pharmacy Operations: **

- **Regulatory Compliance:** Pharmacist class can be modified to meet the changing pharmaceutical regulations without affecting the Order, InventoryManager or PaymentMethod classes 

- **Inventory Accuracy:** InventoryManager maintains focused responsibility for stock control which is critical for medication availability across branches 

- **Payment Security:** PaymentMethodFactory changes don't impact prescription validation or inventory logic 

**Example:** When the Vietnamese Ministry of Health updates the prescription validation requirements, only the Pharmacist class needs modification to implement the new validation logic. The Order, InventoryManager, Loyalty points and Customer remains unchanged which demonstrates how SRP isolates the impact of regulatory changes. 

**4.1.2. Information Hiding **

**Principle: **Classes should be internally cohesive with minimal dependencies between unrelated components. 

**High Cohesion Examples: **

- **Medicine class:** All attributes \(dosage, expiry, interactions\) and behaviors \(validatePrescription, checkInteractions\) are directly related to pharmaceutical products. 

35 



- **Customer class:** Personal information, order history and loyalty features are all customer-centric. 

- **PharmacyBranch class:** Has bran-specific inventory, staff assignment and operation data are logically grouped. 

**Low Coupling Implementation: **

- **Interface-based design: **PaymentMethod interface allows DigitalPayment, CashPayment, and CreditCardPayment implementations without tight coupling to Order classes 

- **Factory patterns:** ProductFactory creates product instances while reducing dependencies between client code and concrete product implementations as shown in our class diagram 

- **Service abstraction:** InventoryManager provides services to multiple classes \(PharmacyBranch, Product, Staff\) without creating tight interdependencies **Benefits for Pharmacy System: **

- **Branch Independence:** Individual pharmacy branches can operate with minimal system dependencies during network issues 

- **Payment Flexibility:** New payment methods \(Vietnamese digital wallets like ZaloPay, MoMo\) can be added without modifying existing order processing logic 

- **Maintenance Efficiency**: Bug fixes in prescription processing don't require testing of unrelated inventory or payment components 

**4.1.3. Consistent Interface Design **

**Principle:** Internal implementation details should be hidden while providing clean public interfaces. 

**Implementation in LC-PMS: **

**- MedicineDatabase: **Hides complex drug interaction algorithms while exposing simple lookup methods to Pharmacist class 

36 



- **InventoryTransaction:** Encapsulates audit trail creation and stock level calculations, exposing only transaction recording methods 

- **CustomerProfile**: Protects sensitive patient information while providing controlled access for prescription processing 

**Security Implementation: **

- **Role-based access: **Staff abstract class encapsulates authentication logic, allowing different access levels for Pharmacist, Cashier, and BranchManager 

- **Prescription privacy: **Prescription class hides patient medical details from unauthorized staff members 

- **Payment security:** Payment method implementations encapsulate sensitive financial data processing 

**Benefits for Pharmacy Operations: **

- **Data Protection:** Patient medical information is protected according to Vietnamese healthcare privacy regulations 

- **Security Compliance: **Controlled access to prescription and payment data reduces regulatory risk 

- **System Integrity:** Internal business logic changes don't affect external interfaces used by mobile apps or web clients 

**4.1.4. Error Handling **

**Principle:** Use composition to build complex behaviors rather than deep inheritance hierarchies. 

**Implementation in LC-PMS: **

- **Order composition:** Order classes contain OrderItem objects and collaborate with Product, Customer, and Delivery classes rather than inheriting these functionalities 

37 



- **Branch composition:** PharmacyBranch collaborates with InventoryRecord and BranchConfiguration data-holder classes rather than inheriting these capabilities 

- **Customer services:** Customer class collaborates with LoyaltyPoint and CustomerProfile rather than inheritance-based extensions 

**Strategic Inheritance Usage: **

- **Product hierarchy: **Medicine, HealthSupplement, and MedicalDevice inherit from abstract Product class for shared pricing and inventory behaviors 

- **Staff hierarchy:** Pharmacist, PharmacyTechnician, BranchManager, and Cashier inherit from abstract Staff class while maintaining specialized responsibilities as defined in our CRC cards 

- **Order types:** PrescriptionOrder, InStoreOrder, and OnlineOrder inherit from abstract Order class while implementing specific workflows 

- **Delivery methods:** PickupDelivery and HomeDelivery inherit from abstract Delivery class for different fulfillment approaches 

**Benefits for Pharmacy System: **

- **Flexibility**: New product types can be created through composition without modifying existing product hierarchies 

- **Extensibility**: Additional customer services \(insurance processing, health consultations\) can be composed without inheritance complexity 

- **Maintainability:** Changes to loyalty programs don't require modification of core Customer class structure 

**4.1.5. Scalability Considerations **

**Principle:** Anticipate growth and performance requirements in design decisions. 

**Implementation in LC-PMS: **

- **Stateless services: **InventoryManager and ReportGenerator are designed to support multiple concurrent operations without maintaining instance state 38 



- **Data separation:** MedicineDatabase provides efficient lookup for frequently accessed drug information without coupling to specific product instances 

- **Event-driven processing:** Order status changes trigger notifications without blocking critical prescription or payment operations 

**Scalability Features:** 

- **Branch distribution:** Each PharmacyBranch maintains local InventoryRecord instances with centralized InventoryManager coordination 

- **Concurrent processing:** Multiple Order instances can be processed simultaneously through independent OrderItem management 

- **Efficient data access:** InventoryTransaction uses optimized recording patterns for high-volume stock movements across 1,600\+ branches 

**Benefits for Large-Scale Operations: **

- **Growth support:** System can handle Long Chau's expansion to 500\+ additional branches in 2025 

- **Peak load management:** Handles 350,000 concurrent customers during promotional periods 

- **Response time:** Maintains 2-second prescription processing time across all branches 

**4.1.6. Security by Design **

**Principle:** Design systems to handle failures gracefully and provide recovery mechanisms. 

**Implementation in LC-PMS: **

- **Transaction integrity:** InventoryTransaction implements comprehensive recording mechanisms for stock transfers between branches 

- **Prescription validation:** Multiple validation layers in Pharmacist class prevent medication errors 

39 



- **Payment processing: **PaymentMethod implementations include validation logic and error handling for transaction failures 

**Error Handling Strategy:** 

- **Graceful degradation: **System continues basic operations even when external delivery or payment services are temporarily unavailable 

- **Audit trails: **All critical operations in Prescription, Order, and InventoryTransaction classes maintain comprehensive logs for regulatory compliance 

- **Manual override:** Emergency protocols allow authorized Staff \(BranchManager, Pharmacist\) to override automated systems when necessary 

**Benefits for Critical Healthcare Operations: **

- **Patient safety: **Multiple prescription validation layers prevent medication errors 

- **Business continuity:** Pharmacy operations continue even during partial system failures 

- **Regulatory compliance: **Complete audit trails support Vietnamese pharmaceutical oversight requirements 

**4.1.7. Maintainability **

**Principle:** Clients should not depend on interfaces they don't use; depend on abstractions, not concretions. 

**Implementation in LC-PMS: **

- **PaymentMethod interface: **DigitalPayment, CashPayment, and CreditCardPayment classes implement only relevant methods \(CashPayment doesn't implement digital verification\) 

- **Product abstractions:** Medicine abstract class provides pharmaceutical-specific interface separate from general Product interface, supporting PrescriptionMedicine and OverTheCounterMedicine specializations 40 



- **Service interfaces:** InventoryManager depends on abstract Product interface rather than concrete Medicine, HealthSupplement, or MedicalDevice implementations 

**Dependency Management: **

- **Abstract dependencies:** Order classes depend on abstract Product and PaymentMethod interfaces rather than specific concrete implementations 

- **Service abstractions:** ReportGenerator depends on abstract data interfaces rather than concrete InventoryRecord or InventoryTransaction implementations 

- **Modular delivery: **New delivery approaches can be added through abstract Delivery class without modifying existing Order processing logic **Benefits for System Evolution: **

- **Technology independence:** Payment processing changes don't require modifications to core Order or Customer logic 

- **Third-party integration: **New delivery partners integrate through standard Delivery interface abstractions 

- **Testing efficiency: **Mock implementations can replace complex services during unit testing of individual classes 

**4.2. Design Principles Applied **

**4.2.1. SOLID Principles: **

**S - Single Responsibility Principle \(SRP\) **

● **Applied:** Each class has one clear purpose 

● **Example:** Pharmacist only handles prescription validation, InventoryManager only manages inventory 

● **Benefit:** Easy to maintain and modify individual components **O - Open/Closed Principle \(OCP\) **

● **Applied:** Classes open for extension, closed for modification 41 



● **Example:** PaymentMethod interface allows new payment types \(Apple Pay, crypto\) without changing existing code 

● **Benefit:** System can grow without breaking existing functionality **L - Liskov Substitution Principle \(LSP\) **

● **Applied:** Subclasses can replace parent classes seamlessly 

● **Example:** Any Staff subclass \(Pharmacist, Cashier\) can be used wherever Staff is expected 

● **Benefit:** Polymorphism works correctly throughout the system **I - Interface Segregation Principle \(ISP\) **

● **Applied:** Interfaces are focused and specific 

● **Example:** PaymentMethod interface only defines payment operations, not inventory or customer management 

● **Benefit:** Classes only depend on methods they actually use **D - Dependency Inversion Principle \(DIP\) **

● **Applied:** High-level modules depend on abstractions, not concrete classes 

● **Example:** Order depends on PaymentMethod interface, not specific payment implementations 

● **Benefit:** Loose coupling enables flexibility and testing **4.2.2. Additional OOP Principles: **

**Encapsulation **

● **Applied:** Internal data and implementation hidden behind public interfaces 

● **Example:** CustomerProfile data only accessible through Customer class methods 

**Inheritance **

● **Applied:** Common behavior shared through class hierarchies 

● **Example:** Staff hierarchy eliminates code duplication across employee types **Polymorphism **

● **Applied:** Same interface, different implementations 42 



● **Example:** All payment methods implement PaymentMethod but process differently 

**Composition over Inheritance **

● **Applied:** Objects contain other objects rather than inheriting everything 

● **Example:** Customer contains CustomerProfile rather than inheriting from it **5. Design Patterns Applications **

**5.1. Creational Patterns **

**5.1.1. Factory Method Pattern **

**A. What is Factory Method Pattern **

A Factory Method defines an interface for creating an object, but lets subclasses / 

concrete factories decide which class to instantiate. 

**B. Reasoning for design choice **

****

**Context **

**Solution **

**Diverse payment channels** 

Checkout code stays unchanged; add a new 

gateway by adding one factory \+ one product 

– Cash, VNPay, MoMo, Credit-card, 

class. 

future BNPL 

**Multiple notification channels** 

UI or event service simply asks the factory; no 

if/else trees in business code. 

– SMS, E-mail, Push, In-app 

**Rich product hierarchy **

Catalog import logic calls 

ProductFactory.create\(typeString\); rules and 

43 



– PrescriptionMedicine, 

attributes live inside the concrete product 

OTCMedicine, HealthSupplement, 

classes. ** **

MedicalDevice** **

****

**Table 41:** Factory method reason choice 



**C. Advantages and disadvantages **

**a. Advantages **

i. 

Encapsulates object creation; client never references concrete classes 

i . 

Easiest way to add new payment/product types. 

i i. 

Improves unit-testing: inject fake factories. 

**b. Disadvantages **

i. 

Adds factory classes & a selector map 

i . 

Selector must map input to the factory. ** **

**D. Applications **

****

**Factory Interface **

**Examples **

PaymentFactory 

CashPaymentFactory, 

VNPayPaymentFactory, 

MoMoPaymentFactory 

NotificationFactory 

SmsFactory, EmailFactory, PushFactory 

ProductFactory 

PrescriptionMedFactory, OTCMedFactory, 

SupplementFactory, DeviceFactory 

DeliveryFactory 

PickupFactory, BikeCourierFactory, 

NationwideCourierFactory 

****

**Table 42:** Factory method applications** **

44 





****

****

****

**E. Pseudocode**



**Figure 2:** Factory Method Pattern Pseudocode 



**F. Example Structure **

45 





**Figure 3:** Factory Method Pattern Example Structure 



****

**5.2. Structural Patterns **

**5.2.1. Adapter Pattern **

**A. What is Adapter Pattern **

Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate. 



**B. Reasoning for design choice **

LC-PMS integrates with multiple external systems \(e.g., GiaoHangNhanh, AhaMove, MoMo, ZaloPay\) that use different data formats, protocols, and APIs. ** **

**C. Advantages and disadvantages **

**● Advantages **

○ Enables reuse of existing code with new systems 

46 





○ Isolates external dependency logic 

○ Makes testing and switching third-party vendors easier 

**● Disadvantages **

○ Adds complexity if too many adapters are scattered 

○ Each adapter must be maintained when APIs changes 



**D. Applications **

● GiaoHangNhanhAdapter implements the internal DeliveryPartner interface 

● MoMoPaymentAdapter translates LC’s payment object into MoMo’s API format 

● Used by PartnerIntegrationService to support multiple vendors **E. Pseudocode **

****

**Figure 4:** Adapter pattern pseudocode 





****

47 





**F. Example Structure **

****

**Figure 5:** Adapter Pattern Example Structure 

****

****

**5.2.2. Facade Pattern **

**A. What is Facade Pattern **

Facade pattern is a structural design pattern that provides a simplified, unified interface to a complex subsystem. 



**B. Reasoning for design choice **

48 



LC-PMS has many internal services \(inventory, order fulfillment, notifications, payment, prescription validation\). Exposing these directly to external systems \(e.g., partner APIs, reporting tools\) would increase coupling and complexity. 



**C. Advantages and disadvantages **

**● Advantages **

i. 

Simplifies integration with external/internal modules 

i . 

Reduces code duplication and complexity 

i i. 

Hides the underlying implementation details 

**b. Disadvantages **

i. 

Adds another abstraction layer 

i . 

Can become a “god object” if not well-maintained 

****

****

**D. Applications **

PharmacySystemFacade offers methods like: 

a. placeOrder\(customerId, orderData\) 

b. syncInventory\(branchId\) 

c. validatePrescription\(prescriptionId\) 

Used by front-end apps and external partner APIs without needing to know internal implementation. 



**E. Pseudocode **

49 





****

****

****

****

**Figure 5:** Facade Pattern Pseudocode 



**F. Example Structure **

****

****

****

****

**Figure 6:** Facade Pattern Example Structure** **

****

**5.3. Behavioral Patterns **

**5.3.1. Observer Pattern **

**A. What is Observer Pattern: **

50 



The Observer pattern is a behavioral design pattern that establishes a one-to-many dependency between objects. It allows a subject to notify multiple observers about changes in its state, enabling them to update accordingly. 



**B. Reasoning behind our design choice: **



**Context **

**Problems **

Long Chau PMS needs to 

Synchronous call-chain could choke point the whole 

process millions of transactions check out path 

& near real-time stocks 

management 

Many independent reactions 

Point-to-point integrations between components 

\(SMS, email, stock alert, BI 

create tight coupling and brittle dependencies 

Dashboards,...\) 

External services are not 

A slow or non responding services can block or 

consistencies in latency 

crash the essential order and inventory flow 

****

**Table 43:** Observer pattern reasoning choice 



Observers Pattern can help solve these problems above by: 

**● *One-to-many fan out resolve bottlenecks ***

*One publish, many subscribers. * 

eg., OrderService posts OrderPlaced; it’s delivered to N consumers in parallel, so throughput scales linearly with hardware, not with code complexity. 

● **Zero-touch extensibility **

51 



New consumers simply subscribe to the topic. Publishers remain oblivious, avoiding risky edits to proven order logic. 

● **Graceful degradation & fault isolation **

Each observer processes its own queue. If the email gateway stalls, stock reservations and SMS updates keep flowing; the e-mail queue can retry independently. ** **

**C. Advantages and disadvantages: **

**● Advantages: **

a\) Publisher and Subscriber share only a tiny interface \(publish, handle\) → 

each can evolve or be unit-tested in isolation. 

b\) Ability to attach new services without heavy modification of existing codebases 

c\) Clean Single Responsibility between publishers and observers 

**● Disadvantages: **

a\) Lack of deterministic order among observers; if order matters we must add explicit priorities or a chain of responsibility. 

b\) Scattered business logics across many small listeners c\) Hard to read dataflow 



**D. Applications: **



**Event Publisher **

**Sample Event **

**Key Observers **

OrderService 

OrderPlace, 

NotificationService 

OrderShipped 

InventoryManager 

StockLow 

StockAlert 

PrescriptionService PrescriptionApproved CustomerNotification PaymentService 

PaymentSucceed 

CustomerNotification 

52 





****

**Table 44:** Observer pattern applications 



**E. Pseudocode: **



**Figure 7:** Observer Pattern Pseudocode 



**F. Example Structure **

53 





****

**Figure 8:** Observer Pattern Example Structure 

****

**5.3.2. State Pattern **

**A. What is State Pattern **

State is a behavioral design pattern that lets an object alter its behavior when its internal state changes. It appears as if the object changed its class. 



**B. Reasoning behind design choice** 

**Context **

**Problems **

LC-PMS has to handle millions of 

Relying on scattered conditionals or enums 

transactions everyday, each 

can lead to invalid transitions like skipping 

transaction must be validated by 

54 



tightly controlled states \(Pending -> 

validation or shipping cancelled orders. 

Validated -> Shipped\) 



Certain transitions require 

Bugs in logic or concurrency issues can 

legal/logistical checks \(e.g., 

break the order lifecycle, causing 

prescriptions must be validated before **compliance violations, customer issues,** fulfillment\). 

**or stock corruption**. 

****

**Table 45:** State pattern reasoning choice 



State Pattern can be a solution for the above problems: 

● Each Order **state** \(Pending, Validated, Fulfilled, Cancelled\) becomes a separate class implementing a common OrderState interface. 

● The Order class delegates transition logic to the current state object. 

● Only allowed transitions are implemented; invalid ones throw exceptions. 



**C. Advantages and disadvantages **

**a. Advantages: **

i. 

Replaces brittle if/else checks with clear class Example Structure. 

ii. 

Enforces valid transitions at compile time. 

iii. 

Reduces coupling between Order class and transition logic. 

**b. Disadvantages: **

i. 

Increases the number of classes in the codebase. 

ii. 

Adds some boilerplate if states share many behaviors. 

iii. 

Requires discipline to maintain evolving requirements. 



**D. Applications **

a. **Order Lifecycle **

55 





i. 

Pending → Awaiting Prescription → Validated → Fulfilled → 

Delivered → Completed** **

b. **Prescription Approval Flow **

i. 

Uploaded → Awaiting Pharmacist Review → Approved / Rejected** **

c. **Inventory Adjustment Status **

i. 

InSync → LowStock → Reordered → Restocked 



**E. Pseudocode **

****

**Figure 8:** State Pattern Pseudocode 

56 





****

**F. Example Structure **

****

**Figure 8:** State Pattern Example Structure** **

****

**5.3.3. Strategy Pattern **

**A. What is Strategy Pattern **

57 



Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable. 

**B. Reasoning behind design choice **

**Context **

**Problem **

**Solution **

Many **payment **

A single Order.pay\(\) Order holds a PaymentStrategy; 

**options** \(cash, 

would become a giant 

adding a gateway = add a new class, 

MoMo, VNPay, 

switch\(type\) that you 

no edit to Order. 

credit card, future must edit every time a 

BNPL\) 

new gateway arrives. 

Several **delivery **

Conditional logic 

DeliveryStrategy object 

**modes** \(in-store 

sprawls across 

encapsulates the shipping algorithm; 

pickup, same-day fulfilment code; testing 

fulfilment delegates. 

bike, nationwide 

each branch is painful. 

courier\) 





****

**Table 46:** Strategy pattern reasoning choice** **

**C. Advantages and disadvantages **

**a. Advantages: **

i. 

Open/Closed: add new algorithms without touching clients. 

ii. 

Unit-test each strategy in isolation. 

**b. Disadvantages: **

i. 

More classes & wiring; 

ii. 

Risk of too many tiny classes—group related strategies in packages 

**D. Applications **

**Strategy Family **

**Examples **

58 



PaymentStrategy 

CashPayment, VNPayPayment, MoMoPayment, 

CreditCardPayment 

DeliveryStrategy 

PickupDelivery, BikeCourierDelivery 

****

**Table 47:** Strategy pattern applications 

**E. Pseudocode **

59 





****

**Figure 9:** Strategy Pattern Pseudocode 

****

****

**F. Example Structure **

60 





****

**Figure 10:** Strategy Pattern Example Structure** **





**6. Bootstrap Process **

**1. Set up Core Data Holder **

First, MedicineDatabase loads, which creates all the Medicine subclasses that are available: 

● PrescriptionMedicine, OverTheCounterMedicine, HealthSupplement, MedicalDevice 

● The ProductFactory uses these definitions to make order items later on. 

● BranchConfiguration is made to set the hours of operation, staff duties, and rules for a branch in a certain area. ** **

**2. Create an instance of the Primary Aggregate: PharmacyBranch** The PharmacyBranch is made as the main object. It talks about: 61 



● BranchConfiguration 

● InventoryRecord, which shows the current stock 

● A group of InventoryTransaction objects to keep track of past stock movements 

**3. Make and register staff objects** 

Based on the settings, the following Staff subclasses are created and linked to the PharmacyBranch: 

● BranchManager, Pharmacist, PharmacyTechnician, Cashier, and InventoryManager 

● The abstract Staff class is the parent class for all staff objects, and each one has behavior that is specific to its branch 

**4. Set up the customer domain **

**● **During session handling, Customer objects are either loaded or made. 

**● **A VIPCustomer is created if the customer has more rights. 

**● **Each one is connected to a CustomerProfile, which keeps track of delivery addresses, preferences, and prescription information. ** **

**5. Set up the structure of the order object **

When an order is made, one of its concrete subclasses is formed from the abstract Order: 

● InStoreOrder, OnlineOrder, or PrescriptionOrder 

● The order composition has: 

○ A list of OrderItem objects made by ProductFactory 

○ A Delivery object, like a PickupDelivery or a HomeDelivery 

○ A PaymentMethod object created by PaymentMethodFactory, which lets you choose: 

■ CashPayment, CreditCardPayment, or DigitalPayment 

**6. Handling prescription logic **

● A Prescription object is created if there are prescription items. 

● There is at least one PrescriptionItem entry in it. 

62 



● Using its own logic, the Pharmacist object checks the prescription. 

**7. Set up auxiliary and event-driven parts **

NotificationService is set up and added as an Observer for: 

**● **Order, PaymentMethod, and InventoryManager 

**● **If it applies to the order, LoyaltyPoint is conditionally instantiated. 

**● **The BranchManager can make analytics reports with the help of ReportGenerator. 

**Summary: **

When the system starts up, core data holders like MedicineDatabase and BranchConfiguration are loaded first to set up the basic rules and definitions for how the product works. The main PharmacyBranch object is then created, bringing together InventoryRecord, staff members \(such the BranchManager and Pharmacist\), and connecting to InventoryTransaction logs. Next, we get ready the Customer, VIPCustomer, and related CustomerProfile objects. When someone places an order, the right Order subclass is made. This subclass has OrderItems, a DeliveryMethod, and a PaymentMethod that is made by PaymentMethodFactory. The Pharmacist checks the validity of Prescription and PrescriptionItem objects if prescriptions are involved. Finally, the object graph is complete and event-driven and reporting capabilities are available by initializing auxiliary services like NotificationService, LoyaltyPoint, and ReportGenerator. This bootstrap method ensures that the domain is modular, can be expanded, and has clear lines of responsibility. 



**7. Verification **

To verify that our design for the Long Chau Pharmacy Management System \(LC-PMS\) works, we have gone through seven important real-world scenarios. These are not 63 



simple test cases; they represent the most critical things our system has to do daily: prescription validation, inventory automation, loyalty points. 

Each use case illustrates the interaction and interconnection between our object design, object patterns, and services that can address real business challenges. We have included diagrams to explain the system's behavior step-by-step. 

**7.1. Customer Places Order with Prescriptions **

**Scenario:** Customer uploads prescription and places order for prescribed medicines **Actors**: Customer, Frontend, System, PrescriptionProcessor, Pharmacist, InventoryManager, PaymentMethod, Delivery, NotificationService **Design Coverage**: 

● Leverages the State pattern to ensure orders progress through legal states: *Pending → Validated → Fulfilled*. 

● Uses the Strategy pattern for interchangeable payment processing. 

● Utilizes the Observer pattern to trigger asynchronous notifications \(e.g., SMS, in-app alerts\). 

**Verification Points**: 

● Correct application of the Prescription, PrescriptionOrder, and Pharmacist validation. 

● Real-time inventory verification before payment. 

● Secure payment handled through an appropriate PaymentMethod. 

64 





**Figure 11:** Prescription Purchase Workflow 



This diagram shows how a customer uploads a prescription, selects products, and initiates a purchase. The pharmacist validates the prescription, the system checks stock, and payment is processed. Notifications confirm the order and delivery details to the customer. 

**7.2. Inventory Reorder Processing **

**Scenario:** Automatic reordering when stock levels fall below threshold. 

**Actors**: InventoryManager, Product, Supplier, NotificationService, InventoryTransaction, BranchManager 

**Design Coverage**: 

● Utilizes Observer to notify suppliers and managers once reorder is triggered. 

● Applies Factory for dynamic creation of purchase orders based on product type. 

**Verification Points**: 

65 





● Real-time trigger of InventoryTransaction from threshold breach. 

● Supplier availability check before generating purchase order. 

● Confirmation and logging using NotificationService. 





**Figure 12: **Inventory Reorder Processing 



The diagram illustrates how the InventoryManager monitors stock in real-time. When a threshold is hit, the System checks supplier availability and creates a purchase order. 

Once the supplier confirms, the NotificationService informs branch managers. Upon delivery, InventoryTransaction updates stock levels, and a final confirmation is sent out. 

**7.3. Multi-Branch Stock Transfer **

**Scenario:** Branch requests stock transfer from another location. 

**Actors**: Branch Staff, InventoryManager, BranchManager, InventoryTransaction, DeliveryService, System, NotificationService, ReceivingBranch **Design Coverage**: 

66 





● Uses the Observer pattern to handle transfer initiation and delivery coordination. 

● Inventory movement tracked via InventoryTransaction. 

● Applies role-based access control \(RBAC\) through Staff and BranchManager. 

**Verification Points**: 

● Verification of available stock at other branches. 

● Authorization by BranchManager before dispatch. 

● Proper updates to both branches' InventoryRecord. 

**Figure 13: **Multi-Branch Stock Transfer 



When a branch staff member reports a shortage, the System asks the InventoryManager to check stock at other branches. A transfer is requested and approved by the BranchManager. InventoryTransaction logs the movement, the DeliveryService handles the transfer, and both branches receive confirmations. 

**7.4. Prescription Processing and Approval **

**Scenario:** Pharmacist reviews and approves customer prescription 67 





**Actors**: Customer, Frontend, PrescriptionProcessor, Pharmacist, PaymentProcessor, NotificationService, InventoryManager, System 

**Design Coverage**: 

● PrescriptionProcessor delegates to a Pharmacist for validation. 

● MedicineDatabase is queried to check for interaction risks. 

Notification sent to customer upon approval or rejection. 

**Verification Points**: 

● Seamless collaboration between Prescription, Medicine, and Pharmacist. 

● Compliance with Vietnamese regulations through enforced approval. 

● History logged in PrescriptionRecord for traceability. 

**Figure 14**: Prescription Processing and Approval 

The customer uploads a prescription via the frontend. The PrescriptionProcessor assigns it to a Pharmacist for review. The System checks for medicine conflicts and availability. After approval, the customer is notified. The prescription is also logged in the audit trail for compliance. 

68 





**7.5. Online Order with Delivery **

**Scenario: **Customer places online order with delivery **Actors**: Customer, Frontend, System, Order, Delivery, ProductFactory **Design Coverage**: 

● Factory pattern used to instantiate specific product types. 

● Strategy pattern supports flexible delivery modes \(pickup or home\). 

● State transitions ensure proper flow: *Placed → Processed → Delivered*. 

**Verification Points**: 

● Accurate linking of order to delivery type. 

● Delivery service coordination and order status tracking. 

● Payment processing via selected PaymentMethod. 

**Figure 15:** * * Online Order with Delivery * *** **

The customer places an online order using the frontend. The system creates the order and schedules a delivery \(either pickup or home delivery\). The ProductFactory 69 





determines the product type \(Medicine, Health Supplement, etc.\), and the order is linked to a delivery method. 

**7.6. Staff Generates Order Report **

**Scenario: **BranchManager or Pharmacist requests a report of recent orders for review or operational tracking. 

**Actors: **Staff, ReportGenerator, System, Order 

**Design Coverage: **

**● **ReportGenerator follows the Single Responsibility Principle, focused solely on report creation. 

**● **Aggregates data across Order, InventoryTransaction, and Customer. 

● Report types extendable via modular reporting classes. 

**Verification Points: **

● Secure access only for authorized staff roles. 

● Flexible report formats \(e.g., sales by product, orders by time\). 

● High-volume performance testing for real-world usage. * *

70 





**Figure 16:** Staff generates order report 

A BranchManager or Pharmacist requests a report. The ReportGenerator queries the system for relevant orders and returns the compiled report. 

**7.7. Loyalty Points After Payment **

**Scenario:** After completing a purchase, the customer receives loyalty points based on the payment made. 

**Actors**: Customer, Order, PaymentMethod, LoyaltyPoint, System, Frontend **Design Coverage**: 

● LoyaltyPoint is a loosely coupled service called only upon confirmed payment. 

Uses Observer to trigger reward allocation asynchronously. 

● Point calculation encapsulated in LoyaltyPoint for modularity. 



**Verification Points**: 

● Only successful payments trigger rewards. 

● Accurate point calculation based on purchase value and tier. 

● Points added to CustomerProfile for future use. 

71 



**Figure 17: **Loyalty Points After Payment 

After a customer completes a payment, the system invokes the selected payment method and, if successful, triggers loyalty point allocation. 



**8. References **

**\[1\]** “Abstract Factory Design Pattern,” Refactoring.Guru. \[Online\]. Available: 

https://refactoring.guru/design-patterns/abstract-factory. \[Accessed: 06-Jul-2025\]. ** **

**\[2\]** "Design Patterns," Refactoring.guru, 2019. \[Online\]. Available: 

https://refactoring.guru/design-patterns. \[Accessed: 05-Jul-2025\]. 

**\[3\]** Object Management Group, "Unified Modeling Language Specification," 2017. 

\[Online\]. Available: https://www.omg.org/spec/UML/.  \[Accessed: 25-Jun-2025\]. 

**\[4\]** Oracle Corporation, "Java Platform Design Patterns," 2023. \[Online\]. Available: 

https://docs.oracle.com/javase/tutorial/. \[Accessed: 25-Jun-2025\]. 

**\[5\]** "Object-Oriented Design Heuristics," Vincentuston.org, 2019. \[Online\]. Available: 

http://www.vincentuston.org/ood/oo\_design\_heuristics.html. \[Accessed: 01-Jul-2025\]. 

**\[6\]** Tanca, "Cách quản lý chuỗi cửa hàng: Mô hình và kinh nghiệm cần biết," *Tanca* *Blog*, Jul. 6, 2025. \[Online\]. Available: 

https://tanca.io/blog/cach-quan-ly-chuoi-cua-hang-mo-hinh-va-kinh-nghiem-can-biet. 

\[Accessed: 25-Jun-2025\]. 

**\[7\]** "Understanding UML Diagram Relationships," nullptr1738.wordpress.com, 2021. 

\[Online\]. Available: 

https://nullptr1738.wordpress.com/2021/09/25/understanding-uml-diagram-relationships

/. \[Accessed: 26-Jun-2025\]. 

**\[8\]** "UML Relations," UMLBoard, 2024. \[Online\]. Available: 

https://www.umlboard.com/docs/relations/. \[Accessed: 01-Jul-2025\]. 

72 



**\[9\]** "UML Class Diagram Tutorial," Visual Paradigm, 2024. \[Online\]. Available: 

https://www.visual-paradigm.com/guide/uml-unified-modeling-language/uml-class-diagra

m-tutorial/. \[Accessed: 01-Jul-2025\]. 

**\[10\]** Swinburne University of Technology. \(n.d.\). *Assignment 2 – Sample HD submission *

*\[Unpublished student assignment\]*. Canvas. 

**\[11\]** Swinburne University of Technology. \(n.d.\). *Assignment 2 – Sample submission *

*\[Unpublished student assignment\]*. Canvas. 



73 



**9. Appendix **

Assignment 1: 

ASM - LC-PMS SRS Document  



74 


# Document Outline

+ OBJECT DESIGN  
+   
+ Executive Summary  
+ 1.​Introduction   
	+ 1.1. Outlook of Solution  
	+ 1.2. Trade-offs and Design Decisions  
	+ 1.3. Definitions, Acronyms, and Abbreviation  

+ 2.​Problem Analysis   
	+ 2.1. Goals  
	+ 2.2. Assumptions  
	+ 2.3. Simplifications  

+ 3.​Candidate Classes   
	+ 3.1. Candidate Class List  
	+ 3.2. UML Diagram  
	+ 3.3. CRC Cards   
		+ 3.3.1. Abstract Classes  
		+ 3.3.2. Interface  
		+ 3.3.3. Concrete Domain Classes  
		+ 3.3.4. Data-Holder Classes  

	+ 3.4. Class Selection Justification  

+ 4.​Design Quality   
	+ 4.1 Design Heuristics   
		+ 4.1.1. Single Responsibility Principle  
		+ 4.1.2. Information Hiding  
		+ 4.1.3. Consistent Interface Design  
		+ 4.1.4. Error Handling  
		+ 4.1.5. Scalability Considerations  
		+ 4.1.6. Security by Design  
		+ 4.1.7. Maintainability  

	+ 4.2. Design Principles Applied   
		+ 4.2.1. SOLID Principles:  
		+ 4.2.2. Additional OOP Principles:  


+ 5.​Design Patterns Applications   
	+ 5.1. Creational Patterns   
		+ 5.1.1. Factory Method Pattern  

	+   
	+ 5.2. Structural Patterns   
		+ 5.2.1. Adapter Pattern  
		+   
		+ 5.2.2. Facade Pattern  

	+ 5.3. Behavioral Patterns   
		+ 5.3.1. Observer Pattern  
		+   
		+ 5.3.2. State Pattern  
		+   
		+ 5.3.3. Strategy Pattern  


+ 6.​Bootstrap Process  
+ 7.​Verification   
	+ 7.1. Customer Places Order with Prescriptions  
	+ 7.2. Inventory Reorder Processing  
	+ 7.3. Multi-Branch Stock Transfer  
	+ 7.4. Prescription Processing and Approval  
	+ 7.5. Online Order with Delivery  
	+ 7.6. Staff Generates Order Report  
	+ 7.7. Loyalty Points After Payment  

+ 8.​References



