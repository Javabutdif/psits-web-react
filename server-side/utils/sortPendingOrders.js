function orderSort(resultArray, sort) {
  if (!resultArray || !sort || sort.length === 0) {
    return resultArray;
  }

  // Create a copy of the array to avoid mutating the original
  const sortedArray = [...resultArray];

  sortedArray.sort((a, b) => {
    for (const sortItem of sort) {
      const { field, direction } = sortItem;
      let compareResult = 0;

      // Handle different field types
      if (field === 'product_name') {
        // String comparison
        compareResult = a[field].localeCompare(b[field]);
      } else if (field === 'total') {
        // Numeric comparison
        compareResult = a[field] - b[field];
      } else if (field === 'yearCounts') {
        // Default to comparing first year if yearCounts is selected
        compareResult = a[field][0] - b[field][0];
      } else if (field.startsWith('year_')) {
        // Handle specific year index (e.g., yearCounts_0 for first year)
        const yearIndex = parseInt(field.split('_')[1]) - 1;
        compareResult = a.yearCounts[yearIndex] - b.yearCounts[yearIndex];
      }

      // Adjust for sort direction
      if (direction === 'desc') {
        compareResult = -compareResult;
      }

      // If comparison is not equal, return the result
      if (compareResult !== 0) {
        return compareResult;
      }
    }

    // If all sort fields are equal, return 0
    return 0;
  });

  return sortedArray;
}

module.exports = orderSort;