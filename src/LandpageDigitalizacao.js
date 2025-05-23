
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import saveAs from "file-saver";

// --- Conversão ---
const conversionFactors = {
  caixa: { metroLinear: 0.14 },
  metroLinear: {
    metroCubo: 0.08,
  },
  metroCubo: {
    metroLinear: 12,
    quilograma: 600,
  },
  quilograma: {
    metroLinear: 0.025,
    metroCubo: 0.001,
  },
  tonelada: {
    metroLinear: 25,
    metroCubo: 12,
  },
};

const units = [
  "caixa",
  "metroLinear",
  "metroCubo",
  "quilograma",
  "tonelada",
];

const unitLabels = {
  caixa: "Caixas de arquivo",
  metroLinear: "Metros Lineares",
  metroCubo: "Metros Cúbicos",
  quilograma: "Quilogramas",
  tonelada: "Toneladas",
};

const unitSuffixes = {
  caixa: " cx",
  metroLinear: " m",
  metroCubo: " m³",
  quilograma: " kg",
  tonelada: " t",
};

function convert(value, unit) {
  const result = {};

  if (isNaN(value) || value <= 0) return result;

  switch (unit) {
    case "caixa": {
      const metroLinear = value * conversionFactors.caixa.metroLinear;
      result["metroLinear"] = metroLinear;
      break;
    }
    case "metroLinear": {
      const metroLinear = value;
      if (conversionFactors.metroLinear.metroCubo)
        result["metroCubo"] = metroLinear * conversionFactors.metroLinear.metroCubo;
      break;
    }
    case "metroCubo": {
      const metroLinear = value * conversionFactors.metroCubo.metroLinear;
      result["metroLinear"] = metroLinear;
      result["quilograma"] = value * conversionFactors.metroCubo.quilograma;
      break;
    }
    case "quilograma": {
      const metroLinear = value * conversionFactors.quilograma.metroLinear;
      result["metroLinear"] = metroLinear;
      result["metroCubo"] = value * conversionFactors.quilograma.metroCubo;
      break;
    }
    case "tonelada": {
      const metroLinear = value * conversionFactors.tonelada.metroLinear;
      result["metroLinear"] = metroLinear;
      result["metroCubo"] = value * conversionFactors.tonelada.metroCubo;
      break;
    }
  }

  return result;
}

function exportConversionToCSV(inputValue, unit, converted) {
  let csvContent = `Unidade Origem,Valor
${unit},${inputValue}
`;
  for (const [key, value] of Object.entries(converted)) {
    csvContent += `${unitLabels[key]},${value.toFixed(2)}${unitSuffixes[key]}
`;
  }
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "conversao_arquivamento.csv");
}

function ConversionTool({ inputValue, setInputValue, unit, setUnit, converted, setConverted }) {
  useEffect(() => {
    const numericValue = Number(inputValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      setConverted(convert(numericValue, unit));
    } else {
      setConverted({});
    }
  }, [inputValue, unit]);

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-semibold">Conversor de Medidas de Arquivamento</h2>
      <p className="text-gray-600 text-sm">Preencha um valor e escolha a unidade de medida para ver as conversões equivalentes conforme regras médias de mercado.</p>
      <div className="flex items-end gap-2">
        <Input
          type="number"
          placeholder="Digite um valor"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u} value={u}>{unitLabels[u]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {Object.keys(converted).length > 0 && (
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
            {Object.entries(converted).map(([key, value]) => (
              <div key={key} className="text-sm text-gray-700">
                <strong>{unitLabels[key]}:</strong> {value ? `${value.toFixed(2)}${unitSuffixes[key]}` : "-"}
              </div>
            ))}
          </CardContent>
          <div className="px-4 pb-2 text-gray-500 text-xs">
            <p><strong>Regras de Conversão:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Caixa em Metros Lineares: multiplica-se por 0,14</li>
              <li>Metros Lineares em Metros Cúbicos: multiplica-se por 0,08</li>
              <li>Quilogramas em Metros Lineares: multiplica-se por 0,025</li>
              <li>Quilogramas em Metros Cúbicos: multiplica-se por 0,001</li>
              <li>Toneladas em Metros Lineares: multiplica-se por 25</li>
              <li>Toneladas em Metros Cúbicos: multiplica-se por 12</li>
              <li>Metros Cúbicos em Metros Lineares: multiplica-se por 12</li>
              <li>Metros Cúbicos em Quilogramas: multiplica-se por 600</li>
            </ul>
            <p className="mt-2 italic text-gray-400">
              Fonte:<br />
              Manual de identificação de acervos documentais para transferência e/ou recolhimento aos arquivos públicos - Publicação técnica nº 40, do Arquivo Nacional, 1985
            </p>
          </div>
          <div className="p-4 text-right">
            <Button variant="outline" onClick={() => exportConversionToCSV(inputValue, unit, converted)}>Exportar para CSV</Button>
          </div>
        </Card>
      )}
    </section>
  );
}

export default function LandpageDigitalizacao() {
  const [inputValue, setInputValue] = useState("");
  const [unit, setUnit] = useState("caixa");
  const [converted, setConverted] = useState({});

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <ConversionTool
        inputValue={inputValue}
        setInputValue={setInputValue}
        unit={unit}
        setUnit={setUnit}
        converted={converted}
        setConverted={setConverted}
      />
    </div>
  );
}
