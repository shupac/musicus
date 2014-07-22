Twitter Example
===================

This is an example of the MenuApp template to display twitter data.

## Config

The config file is what specifies the layout, look, and feel to the app.  It will configure all of the app's components but does not pass down options to subcomponents.  A debug flag exists to tell the app whether or not to surface sliders to control the physics on various components.

## Sections

- HomeSection: Tweet data with click events bound to bring in a subsection.  Contains a lightbox for inner sections
  - TweetSection: Single tweet as a section.  Contained in a sequenceview
- ConnectSection: Scrollable Twitter data
- MyItemsSection: Scrollable Twitter data
- MeSection: Scrollable Twitter data

## Data

Data is currently being pulled from Firebase and saved in Backbone collections.  In the case of HomeSection, loading the data will trigger a change from the loading screen to the filled out scrollview.