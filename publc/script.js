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
  
  // Perform automatic page refresh after 10 seconds using AJAX
  setInterval(function() {
    // Perform AJAX request
    $.ajax({
      url: "http://localhost:8080/",
      method: "GET",
      success: function(response) {
        // Handle the success response
        
        // Reload the page
        location.reload();
      },
      error: function(error) {
        // Handle the error response
      }
    });
  }, 60000);
});
