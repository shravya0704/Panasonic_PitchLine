import { products } from "./data/models.ts";
import { calculatePowerFlow } from "./lib/calculations/calculatePowerFlow";
import { calculateConfiguration } from "./lib/calculations/calculateConfiguration";

function App() {
  const result = calculateConfiguration(
    products[0], // PFP LH-NP12P27
    6,           // Width
    8            // Height
  );

  console.log("Configuration Result:", result);

  return (
    <div>
      <h1>Panasonic Configurator Test</h1>

      <pre>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export default App;