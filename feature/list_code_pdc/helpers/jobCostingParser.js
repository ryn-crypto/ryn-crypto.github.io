// helpers/jobCostingParser.js

export const parseJobCosting1 = (doc) => {
  const vehicles = doc.vehicles || [];

  const flattened = vehicles.flatMap(vehicle => {
    const codes = vehicle.productData || ["-", "-", "-"];
    const describe = vehicle.describe || "SET";
    const idList = Array.isArray(vehicle.id) ? vehicle.id : [vehicle.id];

    return idList.map(mobilName => ({
      id: doc.id,
      batchNumber: doc.batchNumber || "",
      warehouseCode: doc.kodeGudang,
      code: codes,
      describe: [describe],
      mobil: [mobilName],
    }));
  });

  return flattened;
};

export const parseJobCosting2 = (doc) => {
  const vehicles = doc.vehicles || [];

  const flattened = vehicles.flatMap(vehicle => {
    const codes = vehicle.code || ["-", "-", "-"];
    const describe = vehicle.describe || "SET";
    const idList = Array.isArray(vehicle.id) ? vehicle.id : [vehicle.id];

    return idList.map(mobilName => ({
      id: doc.id,
      batchNumber: doc.batchNumber || "",
      warehouseCode: doc.kodeGudang,
      code: codes,
      describe: [describe],
      mobil: [mobilName],
    }));
  });

  return flattened;
};