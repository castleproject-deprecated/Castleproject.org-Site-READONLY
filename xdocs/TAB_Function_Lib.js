/****************************************************************************
* Accessible Tabs 1.0
* Written by Greg Burghardt
* greg_burghardt@yahoo.com
*
* This was created as open source software and is free to download and
* distribute. Please include this JavaScript code in its entirety. 
****************************************************************************/

// Determines whether any occurence of the TAB class can parse the window
// location to detect if a tab box should be switched to active. When false,
// the TAB.detectTabByURL() function will search the window location for a
// page anchor and switch the proper tab and tab box on if that ID is found
// in the this.tabBoxIDs[] array.
var TAB_Found_In_URL = false;



/****************************************************************************
* Declare the TAB class.
****************************************************************************/
function TAB() {
 // Version string
 this.version = "Accessible Tabs: Version 1.0";
 
 // Detect standard DOM
 this.DOM     = document.getElementById;
 
 this.name              = "";          // ID of tab wrapper
 this.isInitialized     = false;       // Whether or not the initialization function has been called
 this.tabIDs            = new Array(); // Array of IDs for individual tabs
 this.tabNodes          = new Array(); // Node references to tab links
 this.activeTabID       = "";          // ID of the active tab
 this.activeTabIndex    = 0;           // Array indice of the active tab
 this.boxIDs            = new Array(); // Array of tab box IDs
 this.boxNodes          = new Array(); // Array of node references to tab boxes
 this.makeUniformHeight = false;       // Flag to make all tab boxes a uniform height
 this.size              = 0;           // Number of tab boxes in tab structure
 this.tabSpacerID       = "";          // ID of the spacer DIV under the tabs
 this.tabRootID         = "";          // ID of the OL or UL tag which directly holds the tabs
 this.tabOptionsID      = "";          // ID of the element containing the tab options link at the bottom
 
 
 
 /***************************************************************************
 * Declare the prototypes for the member functions.
 ***************************************************************************/
 if (typeof(_tab_prototype_called) == 'undefined') {
  _tab_prototype_called = true;
  TAB.prototype.initialize         = initialize;
  TAB.prototype.initializeWithIDs  = initializeWithIDs;
  TAB.prototype.uninitialize       = uninitialize;
  TAB.prototype.switchTab          = switchTab;
  TAB.prototype.detectTabByURL     = detectTabByURL;
  TAB.prototype.getVersion         = getVersion;
  TAB.prototype.getTabIndexByID    = getTabIndexByID;
  TAB.prototype.getTabBoxIndexByID = getTabBoxIndexByID;
 }
 
 
 
 /***************************************************************************
 * Initializes the tab box. It does not take any parameters and assumes
 * you've given the data structure a name, at least one ID for a tab, the
 * active tab's ID and at least one tab box ID. This function activates the
 * default tab (as denoted by this.activeTabID).
 ***************************************************************************/
 function initialize() {
  if (this.DOM &&
      this.name         != "" &&
      this.tabIDs[0]    != "" &&
      this.boxIDs[0]    != "" &&
      this.tabSpacerID  != "" &&
      this.tabOptionsID != "" &&
      this.tabRootID    != "") {
   // Get a node reference to the tabs' root element and activate it
   var TabRoot = document.getElementById(this.tabRootID);
   TabRoot.className = "tabbedNavOn";
   
   this.size = this.tabIDs.length;
   
   this.activeTabID = this.tabIDs[0];
   
   for (var i = 0; i < this.size; i++) {
    this.tabNodes[i] = document.getElementById(this.tabIDs[i]);
    this.boxNodes[i] = document.getElementById(this.boxIDs[i]);
    
    if (this.tabNodes[i].id == this.activeTabID) {
     this.boxNodes[i].className = "tabBoxOn";
     this.tabNodes[i].className = "tabOn";
     this.activeTabIndex = i;
    } else {
     this.boxNodes[i].className = "tabBoxOff";
     this.tabNodes[i].className = "tabOff";
    }
   }
   
   TabRoot = document.getElementById(this.tabSpacerID);
   if (TabRoot != "undefined")
    TabRoot.className = "tabSpacerOn";
   
   TabRoot = document.getElementById(this.tabOptionsID);
   // if (TabRoot != "undefined")
   //  TabRoot.className = "tabOptionsOn";
   
   TabRoot = null;
   this.isInitialized = true;
   // If a page anchor pointing to a tab box exists in the window location,
   // find it and switch to the proper tab.
   this.detectTabByURL();
  }
 }
 
 
 /***************************************************************************
 * Initializes the entire tab structure by passing variables to this function
 * for all needed IDs
 ***************************************************************************/
 function initializeWithIDs(Name, RootID, SpacerID, OptionsID) {
  if (this.DOM) {
   this.name         = Name;
   this.tabRootID    = RootID;
   this.tabSpacerID  = SpacerID;
   this.tabOptionsID = OptionsID;
   
   this.initialize();
  }
 }
 
 
 
 /***************************************************************************
 * Removes all node references for this instance of the TAB class. This
 * should occur when the window.onunload event is fired to clean up any node
 * references that might be double-referenced, which should prevent memory
 * leaks in Internet Explorer 5.01 - 6.0.
 ***************************************************************************/
 function uninitialize(override) {
  if (this.isInitialized || override) {
   for (var i = 0; i < this.size; i++) {
    this.tabNodes[i] = null;
    this.boxNodes[i] = null;
   }
   this.isInitialized = false;
  }
 }
 
 
 
 /***************************************************************************
 * Switches to a new tab. Gets the ID of the active Tab and whether or not a
 * null value should be returned to nullify a tab link's click (and
 * consequent browser location change).
 ***************************************************************************/
 function switchTab(ActiveID, ReturnValue) {
  if (this.isInitialized) {
   this.activeTabID = ActiveID;
   this.tabNodes[this.activeTabIndex].className = "tabOff";
   this.boxNodes[this.activeTabIndex].className = "tabBoxOff";
   
   for (var i = 0; i < this.size; i++) {
    if (this.tabNodes[i].id == this.activeTabID) {
     this.tabNodes[i].className = "tabOn";
     this.boxNodes[i].className = "tabBoxOn";
     this.activeTabIndex = i;
     if (ReturnValue != null)
      return ReturnValue;
    }
   }
   return true;
  }
 }
 
 
 
 /***************************************************************************
 * Detects if a tab box has been referenced in the window location and
 * switches to the correct tab. This makes it so you can bookmark the page
 * under a given tab, and return to the page via the bookmark or link and
 * have the appropriate tab active.
 ***************************************************************************/
 function detectTabByURL() {
  if (!TAB_Found_In_URL) {
   var fullurl = "" + window.location;
   var hashPos = 0;
   var activeTabBoxID = "";
   var newActiveTabIndex = 0;
   
   hashPos = fullurl.indexOf("#");
   
   if (hashPos > 0) {
    // Get the page anchor, which is the ID of the soon-to-be active tab box.
    activeTabBoxID = fullurl.substring(hashPos + 1, fullurl.length);
    newActiveTabIndex = this.getTabBoxIndexByID(activeTabBoxID);
    
    if (newActiveTabIndex > -1) {
     // Switch to the appropriate tab.
     this.switchTab(this.tabIDs[this.getTabBoxIndexByID(activeTabBoxID)], null);
     
     // Prevent other occurences of the TAB class from trying to detect the
     // active tab if a URL has a page anchor in it.
     TAB_Found_In_URL = true;
    }
   }
  }
 }
 
 
 
 /***************************************************************************
 * Returns the current version of Accessible Tabs.
 ***************************************************************************/
 function getVersion() {
  return this.version;
 }
 
 
 
 /***************************************************************************
 * Given a tab's ID, this will return it's indice in the TAB.tabIDs array.
 ***************************************************************************/
 function getTabIndexByID(id) {
  for (var i = 0; i < this.size; i++) {
   if (this.tabIDs[i] == id)
    return i;
  }
  return -1;
 }
 
 
 
 /***************************************************************************
 * Given a tab boxe's ID, this will return it's indice in the TAB.tabBoxIDs
 * array.
 ***************************************************************************/
 function getTabBoxIndexByID(id) {
  for (var i = 0; i < this.size; i++) {
   if (this.boxIDs[i] == id)
    return i;
  }
  return -1;
 }
}



/****************************************************************************
* Global tab function to uninitialize an array containing instances of the
* TAB class. This is mainly to prevent memory leaks in Internet Explorer.
* This function should always be used when the page unloads.
****************************************************************************/
function TAB_GLOBAL_UNINITIALIZE(Tabs) {
 for (i = 0; i < Tabs.length; i++) {
  Tabs[i].uninitialize(true);
 }
}