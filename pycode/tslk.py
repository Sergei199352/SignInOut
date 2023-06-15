import requests
  
# Sample array
array = [1,2,3,4,5,6,7,8,9,10]
  
# Data that we will send in post request.
data = {'array':array}
  
# The POST request to our node server
res = requests.post('51.104.28.83/arraysum', json=data) 
  
# Convert response data to json
returned_data = res
  
print(returned_data)
result = returned_data
print("Sum of Array from Node.js:", result)