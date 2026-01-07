// backend/utils/pricingCalculator.js
const calculateTotalPrice = (car, reservationData) => {
    const timeDiff = reservationData.returnAt - reservationData.pickupAt;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    let total = car.dailyRate * days;
  
    // Service Add-ons
    if (reservationData.services.chauffeur) total += 50 * days;
    if (reservationData.services.babySeat) total += 15 * days;
    if (reservationData.services.gps) total += 10 * days;
  
    // Insurance
    switch(reservationData.services.insurance) {
      case 'full': total += 30 * days; break;
      case 'tires': total += 15 * days; break;
      case 'additionalDriver': total += 20 * days; break;
    }
  
    return total;
  };
  
  module.exports = { calculateTotalPrice };