$(document).ready(function() {
    // Hide the initially visible table
    $("#marshals").hide();
    
    // Attach a click event handler to the button
    $("#toggleTable").click(function() {
      // Toggle the visibility of the tables
      $("#marshals, #aiders").toggle();
    });
  });
  