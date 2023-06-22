$(document).ready(function() {
    // Hide the initially visible table
    $("#marshals").hide();
    
    // Attach a click event handler to the marshals button
    $("#toggleMarshalsTable").click(function() {
      $("#marshals").toggle();
    });
    
    // Attach a click event handler to the aiders button
    $("#toggleAidersTable").click(function() {
      $("#aiders").toggle();
    });
  });
  