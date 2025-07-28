const filterUniqueColors = (productArray: any) => {
   
  const colorMap = new Map();
  if (productArray) {
    let data = [...productArray];
    data.forEach((item: any) => {
      const colorOption = item.node.selectedOptions.find(
        (option: any) => option.name === "Color"
      );

      if (colorOption) {
        const colorValue = colorOption.value;

        if (!colorMap.has(colorValue)) {
          colorMap.set(colorValue, []);
        }
        colorMap.get(colorValue).push(item);
      }
    });
    // Filter the objects with the same color
    const resultArray: any = [];
    colorMap.forEach((items) => {
      if (items.length >= 1) {
        // If you want only arrays with more than one object with the same color
        // resultArray.push(...items);
        // If you want to include only the first item with the same color
        resultArray.push(items[0]);
      }
    });
    return resultArray;
  }
};
export default filterUniqueColors;
