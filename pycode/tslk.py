import requests
  
# Sample array
array = [1,2,3,4,5,6,7,8,9,10]
  
# Data that we will send in post request.
data = {'array':array}
  
# The POST request to our node server
res = requests.post('20.90.226.171,20.90.226.197,20.90.226.238,20.90.227.32,20.90.227.42,20.90.227.94,20.90.134.24/arraysum', json=data) 
  
# Convert response data to json
returned_data = res
  
print(returned_data)
result = returned_data
print("Sum of Array from Node.js:", result)