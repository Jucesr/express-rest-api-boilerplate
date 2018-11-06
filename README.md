# I3-API.
This file is used to explain in detail changes I make to this API as I am buiding it.

<!-- TOC -->

- [I3-API.](#i3-api)
  - [V0.1](#v01)
  - [Glossary](#glossary)

<!-- /TOC -->

## V0.1
Date: Nov 5, 2018

* Initial commit of this file.
* Remove route to POST multiples LIDs it goes against REST rules, just one can be added at a time.
* Improve performance by storing URs of LI in database. It calculates the UR every time a LID is added.
* Route to get a LI no longer calculate the UR, it just take it from the DB.

## Glossary

* LI = Line Item
* LID = Line Item Detail
* EI = Estimate Item
* QTO = Quantity take off
* UR = Unit rate
* DB = Database