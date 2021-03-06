# I3-API.
This file is used to explain in detail changes I make to this API as I am buiding it.

<!-- TOC -->

- [I3-API.](#i3-api)
  - [V0.1.1](#v01)
  - [V0.1.2](#v02)
  - [V0.1.3](#v03)
  - [V0.1.4](#v04)
  - [V0.1.5](#v05)
  - [V0.1.6](#v06)
  - [V0.1.7](#v07)
  - [Glossary](#glossary)

<!-- /TOC -->

## V0.1.1
Date: Nov 5, 2018

* Initial commit of this file.
* Remove route to POST multiples LIDs it goes against REST rules, just one can be added at a time.
* Improve performance by storing URs of LI in database. It calculates the UR every time a LID is added.
* Route to get a LI no longer calculate the UR, it just take it from the DB.

## V0.1.2
Date: Nov 8, 2018

* Get LIDs route would calculate UR of LI. This is temporaly and should be remove before going to PRD
* When a UR of a LI changes it updates all the UR of other line items that are using it.
* When a LID is pushed to a LI it would update its UR and other LI'URs that are connect to it.
* [FIX] A LID can be add by ID now.
* [FIX] POST /line_item/detail return the LID with the ID.
* [NEW] A LID can be modifed by its ID.
* [NEW] A LID can be deleted by its ID.

## V0.1.3
Date: Nov 9, 2018

* Route to get LIDs provides the description, UOM, Currency, UR MXN and UR USD of the LID.
* Route to get LI provides and extra field 'line_item_details' that contains all the IDs to LIDs
* Route to get Estimates provides and extra field 'estimate_items' that contains all the IDs to EIs
* Add Socket.io support.

## V0.1.4
Date: Nov 12, 2018

* Add 'picture_url' property to Project model.
* Disable authentification for all routes for testing purposes.

## V0.1.5
Date: Nov 14, 2018
* Fix bug: "Can't change headers after they were sent". LogService was not imported in estimate controller.s

## V0.1.6
Date: Dec 12, 2018
* Add route to endpoint 'project'. project/:id/materials

## V0.1.7
Date: Dec 20, 2018
* Add route 'line_item/:id/copyTo/:project_id'. It lets you copy a line item to another project. It will also create any sub line items or material that are need it for the main line item. 

## V0.1.8
Date: Dec 26, 2018
* Added 2 columns to Material entity.
  * parent_id: it is used to handle multiple levels of hierachy in the material catalog.
  * is_item: tell wether the entity is a valid item or a hierachy level. 

## V0.1.9
Date: Dec 27, 2018
* Changed property 'is_line_item' to 'is_item' in estimate item entity

## V0.2.0
Date: Jan 08, 2019
* Add line_item_id to fields that are able to be updated in the route of estimate item.
* Add project_id to the query of addDetail method in line item model.

## V0.2.1
Date: Jan 14, 2019

* Pass all the models to each controller. Before only 1 model was passed.
* Add route to get a material by code. /:project_id/materials/:material_code'

## V0.2.2
Date: Jan 15, 2019

* Add route to copy a material from one project to another. If the material has dependencies(parents) it will also copy them.


## Glossary

* DB = Database
* EI = Estimate Item
* LI = Line Item
* LID = Line Item Detail
* MXN = Mexican Peso
* PRD = Production
* QTO = Quantity take off
* UR = Unit rate
* USD = Usa dollar.

