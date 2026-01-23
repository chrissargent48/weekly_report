try {
  console.log("Importing yoga...");
  require('yoga-layout-prebuilt');
  console.log("Yoga imported.");

  console.log("Importing fontkit...");
  require('fontkit');
  console.log("Fontkit imported.");
} catch (e) {
  console.error(e);
}
