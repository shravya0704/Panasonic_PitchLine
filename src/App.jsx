import { ProductService } from "../services/ProductService";
import { calculatePowerFlow } from "./lib/calculations/calculatePowerFlow";
import { calculateConfiguration } from "./lib/calculations/calculateConfiguration";

function App() {
  const products = ProductService.getProducts();
  
  const result = calculateConfiguration(
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