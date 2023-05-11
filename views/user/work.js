var findLucky = function(arr) {
    var mymap = new Map();
    for(let i=0;i<arr.length;i++){
        if(!mymap.has(arr[i])){
        mymap.set(arr[i],1)
        }else{
            mymap.set(arr[i],((mymap.get(arr[i])) + 1));
        }
    }
    var num=0;
    for(let i=0;i<arr.length;i++){
        if(arr[i]===(mymap.get(arr[i])) && arr[i]>num){
            num = arr[i];
        }
    }
    if(num===0) return -1;
    return num;
};