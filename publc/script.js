$(document).ready(function() {
  // Hide the initially visible table
  // hide marshal table
  $("#marshals").hide();
  $("#toggleMarshalsTable").css("background-color","yellow")
  $("#toggleMarshalsTable").css("color","black")
  // hide wheelchairs tble
  $("#wheelchairs").hide();
  $("#toggleWheelchairTable").css("background-color","yellow")
  $("#toggleWheelchairTable").css("color","black")
  
  // Attach a click event handler to the marshals button
  $("#toggleMarshalsTable").click(function() {
    $("#marshals").toggle();
    // changes the format of the button when the table is hidden
    if($('#marshals').is(':hidden'))
    {
      $("#toggleMarshalsTable").css("background-color","yellow")
      $("#toggleMarshalsTable").css("color","black")}
    else{
      $("#toggleMarshalsTable").css("background-color","#003C71")
      $("#toggleMarshalsTable").css("color","white")}
  });
  
  // Attach a click event handler to the aiders button
  $("#toggleAidersTable").click(function() {
    $("#aiders").toggle();
    // changes the format of the button when the table is hidden
    if($('#aiders').is(':hidden'))
   { 
    $("#toggleAidersTable").css("background-color","yellow")
    $("#toggleAidersTable").css("color","black")}
   else {
    $("#toggleAidersTable").css("background-color","#003C71")
    $("#toggleAidersTable").css("color","white")}
  });
  
  
  
  $("#toggleWheelchairTable").click(function() {
    $("#wheelchairs").toggle();
    // changes the format of the button when the table is hidden
    if($("#wheelchairs").is(":hidden"))
    {
      $("#toggleWheelchairTable").css("background-color","yellow")
      $("#toggleWheelchairTable").css("color","black")}
    else{
      $("#toggleWheelchairTable").css("background-color","#003C71")
      $("#toggleWheelchairTable").css("color","white")}
  });
  
  // Perform automatic page refresh after 10 seconds using AJAX
  setInterval(function() {
    // Perform AJAX request
    $.ajax({
      url: "https://rguappsign.azurewebsites.net/",
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
  // the refresh is every 30 min
  }, 1800000);
});
