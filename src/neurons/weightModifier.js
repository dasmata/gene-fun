
const weightModifier = (weight) => {
    if(weight < 0){
        return false
    }
    if (~~(Math.random() * weight)) {
        return true;
    }
    return false;
}