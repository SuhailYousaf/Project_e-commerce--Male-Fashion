var canBeIncreasing = function(nums) {
    let numb = 0;
    let result = true;
  
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] >= numb) {
        numb = nums[i];
      } else if (numb < nums[i]) {
        if (result === false) {
          return false;
        }
        result = false;
        if (i > 0 && nums[i - 1] >= nums[i + 1] && nums[i] <= nums[i - 2]) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  };
  
  // Test the function
  const nums = [1, 2, 6, 5, 8];
  const result = canBeIncreasing(nums);
  console.log(result);
  