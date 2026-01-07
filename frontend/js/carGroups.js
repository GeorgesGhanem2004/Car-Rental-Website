// Advanced implementation for Car Groups UI

// Wait for the DOM to load before executing any code.
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const carGroupsData = await loadCarGroups();
      renderCarGroups(carGroupsData);
      setupCardSelection();
    } catch (error) {
      console.error('Error loading car groups:', error);
    }
  });
  
  /**
   * Fetches the car groups data from an API endpoint.
   * If the API call fails, it falls back to local mock data.
   *
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of car group objects.
   */
  async function loadCarGroups() {
    const API_ENDPOINT = '/api/carGroups'; // Adjust as needed
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      // Optionally, add validation here to ensure the data format is correct
      return data;
    } catch (apiError) {
      console.warn('API unavailable, reverting to mock car group data.', apiError);
      return getMockCarGroups();
    }
  }
  
  /**
   * Returns a mock set of car groups for development and testing.
   *
   * @returns {Array<Object>} Array of car group objects.
   */
  function getMockCarGroups() {
    return [
      {
        groupName: 'SUV',
        specs: {
          engineSize: '2400 cc',
          doors: 5,
          passengers: 7,
          fuelType: 'Diesel',
          gearbox: 'Automatic',
          ac: true,
          electricWindows: true
        }
      },
      {
        groupName: 'Electric',
        specs: {
          engineSize: 'Electric Motor',
          doors: 4,
          passengers: 5,
          fuelType: 'Electric',
          gearbox: 'Automatic',
          ac: true,
          electricWindows: true
        }
      },
      {
        groupName: 'Convertible',
        specs: {
          engineSize: '2000 cc',
          doors: 3,
          passengers: 4,
          fuelType: 'Petrol',
          gearbox: 'Manual',
          ac: false,
          electricWindows: true
        }
      },
      {
        groupName: 'Hybrid',
        specs: {
          engineSize: '1800 cc Hybrid',
          doors: 5,
          passengers: 5,
          fuelType: 'Hybrid',
          gearbox: 'Automatic',
          ac: true,
          electricWindows: true
        }
      },
      {
        groupName: 'Bus',
        specs: {
          engineSize: '5000 cc',
          doors: 4,
          passengers: '30+',
          fuelType: 'Diesel',
          gearbox: 'Automatic',
          ac: true,
          electricWindows: false
        }
      }
    ];
  }
  
  /**
   * Creates a single car group card HTML string using template literals.
   *
   * @param {Object} group - The car group object.
   * @returns {string} HTML string for the card.
   */
  function createCarGroupCard(group) {
    const { groupName, specs } = group;
    // Convert each specification to a list item. Boolean values are shown as Yes/No.
    const specsHtml = Object.entries(specs)
      .map(([key, value]) => {
        // Format the key for display (e.g., "engineSize" -> "Engine Size")
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
        return `<li><strong>${formattedKey}:</strong> ${displayValue}</li>`;
      })
      .join('');
      
    // Return the complete HTML string for the car group card.
    return `
      <div class="car-group-card" data-group="${groupName}">
        <h2>${groupName}</h2>
        <ul>${specsHtml}</ul>
      </div>
    `;
  }
  
  /**
   * Renders all car group cards inside the designated container.
   *
   * @param {Array<Object>} carGroups - An array of car group objects.
   */
  function renderCarGroups(carGroups) {
    const container = document.getElementById('carGroupsContainer');
    if (!container) {
      console.error("Container with id 'carGroupsContainer' not found.");
      return;
    }
    // Create all cards and inject them as one HTML string.
    const cardsHtml = carGroups.map(createCarGroupCard).join('');
    container.innerHTML = cardsHtml;
  }
  
  /**
   * Sets up a click event listener on the car groups container to handle card selections.
   * When a card is clicked, it dispatches a custom event ("carGroupSelected") with the group name.
   */
  function setupCardSelection() {
    const container = document.getElementById('carGroupsContainer');
    container.addEventListener('click', (event) => {
      const card = event.target.closest('.car-group-card');
      if (card) {
        const groupName = card.getAttribute('data-group');
        // Dispatch a custom event so other modules can react (for example, filtering or detail views)
        const eventDetail = { groupName };
        document.dispatchEvent(new CustomEvent('carGroupSelected', { detail: eventDetail }));
        console.log(`Car group selected: ${groupName}`);
      }
    });
  }