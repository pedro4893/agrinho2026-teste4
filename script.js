import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const GAME_WIDTH = 450;
const GAME_HEIGHT = 350;
const GRID_SIZE = 50;

const CROP_TYPES = {
  soja: { cost: 100, waterCost: 15, growTime: 3, reward: 200, emoji: 'Soja' },
  milho: { cost: 120, waterCost: 18, growTime: 4, reward: 250, emoji: 'Milho' },
  organico: { cost: 150, waterCost: 20, growTime: 3, reward: 350, emoji: 'Organico' },
  trigo: { cost: 90, waterCost: 12, growTime: 3, reward: 180, emoji: 'Trigo' },
};

const TUTORIAL_STEPS = [
  {
    title: 'Bem-vindo ao Farm Manager Pro!',
    description: 'Você é um agricultor moderno que deve gerenciar sua fazenda por 6 estacoes. Maximize sua pontuacao combinando estrategia, recursos e decisoes inteligentes!',
    tips: ['Escolha sua dificuldade com sabedoria', 'Cada dificuldade oferece recursos diferentes', 'Fácil: mais dinheiro, Difícil: mais desafiador'],
  },
  {
    title: 'Escolhendo suas Culturas',
    description: 'Existem 4 tipos de culturas com características diferentes. Cada uma tem custo, tempo de crescimento e recompensa distintos.',
    tips: [
      'Soja: Rapida e economica (100 moedas)',
      'Milho: Lenta mas lucrativa (120 moedas)',
      'Organico: Premium com bonus (150 moedas)',
      'Trigo: Barato e rapido (90 moedas)',
    ],
  },
  {
    title: 'Plantando sua Primeira Cultura',
    description: 'Para plantar, selecione o tipo de cultura, clique em "Plantar" e depois clique em uma celula vazia no grid. Cada plantacao consome agua.',
    tips: [
      'Selecione o tipo de cultura primeiro',
      'Clique no botao "Plantar" para ativar o modo',
      'Clique em uma celula vazia para plantar',
      'Você comeca com 100% de agua',
    ],
  },
  {
    title: 'Regando suas Plantacoes',
    description: 'As plantacoes precisam de agua para crescer. Regar aumenta a saude da plantacao em 25%. Cada rega custa 10% de agua.',
    tips: [
      'Monitore a saude das plantacoes',
      'Regue quando a saude cair abaixo de 50%',
      'Agua se regenera lentamente a cada estacao',
      'Sem agua, as plantacoes morrem!',
    ],
  },
  {
    title: 'Usando Pesticidas e Fertilizantes',
    description: 'Pesticidas protegem contra pragas (aumentam saude em 15%). Fertilizantes aceleram crescimento (aumentam saude em 20%). Ambos sao limitados!',
    tips: [
      'Comece com 3 pesticidas e 3 fertilizantes',
      'Ambos se regeneram 1 por estacao (maximo 5)',
      'Use-os estrategicamente em plantacoes valiosas',
      'Culturas organicas dao mais lucro',
    ],
  },
  {
    title: 'Eventos Aleatórios',
    description: 'A cada estacao, eventos aleatórios podem ocorrer: chuva (agua +30%), seca (saude -20%) ou pragas (saude -25%).',
    tips: [
      'Chuva: otima para regenerar agua',
      'Seca: use pesticidas preventivamente',
      'Pragas: afetam todas as plantacoes',
      'Planeje com antecedencia!',
    ],
  },
  {
    title: 'Colhendo suas Plantacoes',
    description: 'Quando uma plantacao atingir sua idade minima de crescimento, você pode colher. Ganha dinheiro baseado no tipo e saude da plantacao.',
    tips: [
      'Soja/Organico/Trigo: 3 estacoes para crescer',
      'Milho: 4 estacoes para crescer',
      'Plantacoes mais saudaveis dao mais lucro',
      'Cada colheita reduz saude do solo em 3%',
    ],
  },
  {
    title: 'Objetivo Final',
    description: 'Maximize sua pontuacao em 6 estacoes! Equilibre lucro, sustentabilidade e gerenciamento de recursos. Boa sorte!',
    tips: [
      'Mantenha biodiversidade acima de 50%',
      'Saude do solo afeta produtividade',
      'Culturas organicas dao 50% mais lucro',
      'Planeje suas 6 estacoes com cuidado!',
    ],
  },
];

export default function FarmGame() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState({
    season: 1,
    money: 1500,
    water: 100,
    soil_health: 70,
    biodiversity: 50,
    crops: [],
    score: 0,
    gameOver: false,
    message: 'Bem-vindo ao Farm Manager Pro!',
    difficulty: 'normal',
    pesticide: 3,
    fertilizer: 3,
    events: [],
    totalHarvested: 0,
  });

  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedCropType, setSelectedCropType] = useState('soja');
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [leaderboard, setLeaderboard] = useState([
    { name: 'Pro Farmer', score: 8500 },
    { name: 'Green Master', score: 7200 },
    { name: 'Tech Farmer', score: 6800 },
  ]);

  const startGame = (difficulty) => {
    const initialMoney = difficulty === 'easy' ? 2000 : difficulty === 'normal' ? 1500 : 1000;
    setGameStarted(true);
    setShowTutorial(false);
    setSelectedAction(null);
    setSelectedCropType('soja');
    setGameState({
      season: 1,
      money: initialMoney,
      water: 100,
      soil_health: 70,
      biodiversity: 50,
      crops: [],
      score: 0,
      gameOver: false,
      message: `Jogo iniciado em dificuldade ${difficulty}!`,
      difficulty,
      pesticide: 3,
      fertilizer: 3,
      events: [],
      totalHarvested: 0,
    });
  };

  const resetGame = () => {
    setGameStarted(false);
    setSelectedAction(null);
    setSelectedCropType('soja');
    setShowLeaderboard(false);
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const plantCrop = (x, y, type) => {
    const cropInfo = CROP_TYPES[type];
    const cost = cropInfo.cost;
    const waterCost = cropInfo.waterCost;

    if (gameState.money < cost) {
      setGameState((prev) => ({ ...prev, message: 'Dinheiro insuficiente!' }));
      return;
    }

    if (gameState.water < waterCost) {
      setGameState((prev) => ({ ...prev, message: 'Agua insuficiente!' }));
      return;
    }

    const hasExisting = gameState.crops.some((c) => c.x === x && c.y === y);
    if (hasExisting) {
      setGameState((prev) => ({ ...prev, message: 'Ja existe plantacao aqui!' }));
      return;
    }

    const newCrop = {
      id: Date.now(),
      type,
      health: 80,
      age: 0,
      x,
      y,
      fertilized: false,
      pesticide_applied: false,
    };

    setGameState((prev) => ({
      ...prev,
      crops: [...prev.crops, newCrop],
      money: prev.money - cost,
      water: prev.water - waterCost,
      biodiversity: Math.min(100, prev.biodiversity + 2),
      message: `Plantou ${type}!`,
    }));
  };

  const waterCrop = (cropId) => {
    if (gameState.water < 10) {
      setGameState((prev) => ({ ...prev, message: 'Agua insuficiente!' }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      crops: prev.crops.map((c) =>
        c.id === cropId ? { ...c, health: Math.min(100, c.health + 25) } : c
      ),
      water: prev.water - 10,
      message: 'Regou a plantacao!',
    }));
  };

  const applyPesticide = (cropId) => {
    if (gameState.pesticide <= 0) {
      setGameState((prev) => ({ ...prev, message: 'Sem pesticida disponivel!' }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      crops: prev.crops.map((c) =>
        c.id === cropId ? { ...c, pesticide_applied: true, health: Math.min(100, c.health + 15) } : c
      ),
      pesticide: prev.pesticide - 1,
      message: 'Aplicou pesticida!',
    }));
  };

  const applyFertilizer = (cropId) => {
    if (gameState.fertilizer <= 0) {
      setGameState((prev) => ({ ...prev, message: 'Sem fertilizante disponivel!' }));
      return;
    }

    setGameState((prev) => ({
      ...prev,
      crops: prev.crops.map((c) =>
        c.id === cropId ? { ...c, fertilized: true, health: Math.min(100, c.health + 20) } : c
      ),
      fertilizer: prev.fertilizer - 1,
      message: 'Aplicou fertilizante!',
    }));
  };

  const harvestCrop = (cropId) => {
    const crop = gameState.crops.find((c) => c.id === cropId);
    if (!crop) return;

    const cropInfo = CROP_TYPES[crop.type];
    if (crop.age < cropInfo.growTime) {
      setGameState((prev) => ({ ...prev, message: 'Plantacao ainda nao esta pronta!' }));
      return;
    }

    const baseReward = cropInfo.reward;
    const healthBonus = Math.floor((crop.health / 100) * 100);
    const bonusMultiplier = crop.type === 'organico' ? 1.5 : 1;
    const reward = Math.floor((baseReward + healthBonus) * bonusMultiplier);

    setGameState((prev) => ({
      ...prev,
      crops: prev.crops.filter((c) => c.id !== cropId),
      money: prev.money + reward,
      soil_health: Math.max(0, prev.soil_health - 3),
      score: prev.score + reward,
      totalHarvested: prev.totalHarvested + 1,
      message: `Colheu ${crop.type}! Ganhou ${reward}!`,
    }));
  };

  const nextSeason = () => {
    setGameState((prev) => {
      const updatedCrops = prev.crops.map((c) => ({
        ...c,
        age: c.age + 1,
        health: Math.max(0, c.health - 8),
      }));

      const aliveCrops = updatedCrops.filter((c) => c.health > 0);

      let eventMessage = '';
      let eventHappened = false;
      const eventChance = Math.random();

      if (eventChance > 0.7) {
        eventMessage = 'Chuva abundante! Agua +30%';
        eventHappened = true;
      } else if (eventChance > 0.5 && aliveCrops.length > 0) {
        eventMessage = 'Seca! Saude das plantacoes reduzida!';
        eventHappened = true;
      } else if (eventChance > 0.35 && aliveCrops.length > 0) {
        eventMessage = 'Praga detectada! Saude reduzida!';
        eventHappened = true;
      }

      let finalCrops = aliveCrops;
      if (eventHappened) {
        if (eventMessage.includes('Seca')) {
          finalCrops = aliveCrops.map((c) => ({ ...c, health: Math.max(0, c.health - 20) }));
        } else if (eventMessage.includes('Praga')) {
          finalCrops = aliveCrops.map((c) => ({ ...c, health: Math.max(0, c.health - 25) }));
        }
      }

      const newWater = eventMessage.includes('Chuva')
        ? Math.min(100, prev.water + 30)
        : Math.max(0, prev.water - 15);

      return {
        ...prev,
        season: prev.season + 1,
        water: newWater,
        soil_health: Math.min(100, prev.soil_health + 3),
        crops: finalCrops,
        message: eventMessage || 'Proxima estacao!',
        events: [...prev.events, eventMessage || 'Estacao tranquila'],
        pesticide: Math.min(5, prev.pesticide + 1),
        fertilizer: Math.min(5, prev.fertilizer + 1),
        gameOver: prev.season >= 6,
      };
    });
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GAME_HEIGHT; y += GRID_SIZE) {
      for (let x = 0; x < GAME_WIDTH; x += GRID_SIZE) {
        const gridX = x / GRID_SIZE;
        const gridY = y / GRID_SIZE;
        const crop = gameState.crops.find((c) => c.x === gridX && c.y === gridY);

        cells.push(
          <div
            key={`${gridX}-${gridY}`}
            onClick={() => {
              if (selectedAction === 'plant') {
                plantCrop(gridX, gridY, selectedCropType);
              } else if (selectedAction === 'water' && crop) {
                waterCrop(crop.id);
              } else if (selectedAction === 'harvest' && crop) {
                harvestCrop(crop.id);
              } else if (selectedAction === 'pesticide' && crop) {
                applyPesticide(crop.id);
              } else if (selectedAction === 'fertilizer' && crop) {
                applyFertilizer(crop.id);
              }
            }}
            className="absolute border border-border/40 hover:border-green-400 transition-all cursor-pointer group"
            style={{
              width: GRID_SIZE,
              height: GRID_SIZE,
              left: x,
              top: y,
              backgroundColor: crop
                ? crop.type === 'organico'
                  ? `rgba(0, 255, 136, ${(crop.health / 100) * 0.4})`
                  : `rgba(0, 217, 255, ${(crop.health / 100) * 0.4})`
                : 'rgba(100, 150, 100, 0.1)',
            }}
          >
            {crop && (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
                <div className="text-lg">{crop.type === 'organico' ? 'O' : crop.type === 'soja' ? 'S' : crop.type === 'milho' ? 'M' : 'T'}</div>
                <div className="text-green-400 text-xs">{crop.health}%</div>
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  // Tutorial Screen
  if (showTutorial && !gameStarted) {
    const step = TUTORIAL_STEPS[tutorialStep];
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="container max-w-2xl">
          <Card className="border-glow p-12 animate-fade-in">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold glow-neon">{step.title}</h2>
                <span className="text-sm text-muted-foreground">Passo {tutorialStep + 1} de {TUTORIAL_STEPS.length}</span>
              </div>
              <div className="w-full bg-border/30 rounded-full h-2 mb-6">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((tutorialStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-8">{step.description}</p>

            <div className="bg-secondary/30 border-glow-blue rounded p-6 mb-8">
              <h4 className="font-bold text-electric-blue mb-3">Dicas importantes:</h4>
              <ul className="space-y-2">
                {step.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="text-green-400 flex-shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4 justify-between">
              <Button
                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                disabled={tutorialStep === 0}
                variant="outline"
                className="border-glow-blue text-electric-blue"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <Button
                onClick={() => setShowTutorial(false)}
                variant="outline"
                className="border-glow-blue text-electric-blue"
              >
                Pular Tutorial
              </Button>

              {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                <Button
                  onClick={() => setTutorialStep(tutorialStep + 1)}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold"
                >
                  Proximo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowTutorial(false)}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold"
                >
                  Comear Jogo
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main Menu
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="container max-w-4xl">
          <Card className="border-glow p-12 text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 glow-neon">Farm Manager Pro</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Gerencie sua fazenda com mais profundidade! Escolha dificuldade, plante diferentes culturas, use pesticidas e fertilizantes estrategicamente. Maximize sua pontuacao em 6 estacoes!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-4">Culturas Disponiveis</h3>
                <div className="space-y-2 text-sm text-left">
                  <div className="border-l-2 border-green-400 pl-3">Soja: Rapida, lucro medio</div>
                  <div className="border-l-2 border-blue-400 pl-3">Milho: Lenta, lucro alto</div>
                  <div className="border-l-2 border-purple-400 pl-3">Organico: Lucro premium</div>
                  <div className="border-l-2 border-yellow-400 pl-3">Trigo: Barato, rapido</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-electric-blue mb-4">Mecanicas</h3>
                <div className="space-y-2 text-sm text-left">
                  <div className="border-l-2 border-green-400 pl-3">Regar: Aumenta saude</div>
                  <div className="border-l-2 border-blue-400 pl-3">Fertilizante: Bonus crescimento</div>
                  <div className="border-l-2 border-purple-400 pl-3">Pesticida: Protege de pragas</div>
                  <div className="border-l-2 border-yellow-400 pl-3">Eventos: Chuva, seca, pragas</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <Button
                onClick={() => startGame('easy')}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-6"
              >
                Facil
              </Button>
              <Button
                onClick={() => startGame('normal')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-6"
              >
                Normal
              </Button>
              <Button
                onClick={() => startGame('hard')}
                className="bg-red-500 hover:bg-red-600 text-black font-bold py-6"
              >
                Dificil
              </Button>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setShowTutorial(true)}
                variant="outline"
                className="border-glow-blue text-electric-blue"
              >
                Ver Tutorial
              </Button>
              <Button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                variant="outline"
                className="border-glow-blue text-electric-blue"
              >
                Ver Ranking
              </Button>
            </div>

            {showLeaderboard && (
              <Card className="border-glow-blue p-6 mt-6 text-left">
                <h3 className="text-xl font-bold text-green-400 mb-4">Top Scores</h3>
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-2">
                    <span>{idx + 1}. {entry.name}</span>
                    <span className="font-bold text-yellow-400">{entry.score}</span>
                  </div>
                ))}
              </Card>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 w-full z-50 border-b border-border/30 backdrop-blur-md bg-background/80">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/')}
              className="p-2 hover:bg-secondary rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold glow-neon">FARM MANAGER PRO</h1>
          </div>
          <div className="text-sm font-bold text-green-400">Estacao {gameState.season}/6 | Dificuldade: {gameState.difficulty}</div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <div className="container">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-glow p-4 relative" style={{ width: '100%', maxWidth: GAME_WIDTH }}>
                <div className="relative bg-gradient-to-b from-green-900/20 to-green-900/10 overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
                  {renderGrid()}
                </div>
              </Card>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(CROP_TYPES).map(([type, info]) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedCropType(type)}
                    className={selectedCropType === type ? 'bg-green-500 text-black' : 'border-glow-blue text-electric-blue'}
                    variant={selectedCropType === type ? 'default' : 'outline'}
                    size="sm"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2">
                <Button
                  onClick={() => setSelectedAction(selectedAction === 'plant' ? null : 'plant')}
                  className={selectedAction === 'plant' ? 'bg-green-500 text-black' : 'border-glow-blue text-electric-blue'}
                  variant={selectedAction === 'plant' ? 'default' : 'outline'}
                  size="sm"
                >
                  Plantar
                </Button>
                <Button
                  onClick={() => setSelectedAction(selectedAction === 'water' ? null : 'water')}
                  className={selectedAction === 'water' ? 'bg-blue-500 text-black' : 'border-glow-blue text-electric-blue'}
                  variant={selectedAction === 'water' ? 'default' : 'outline'}
                  size="sm"
                >
                  Regar
                </Button>
                <Button
                  onClick={() => setSelectedAction(selectedAction === 'fertilizer' ? null : 'fertilizer')}
                  className={selectedAction === 'fertilizer' ? 'bg-yellow-500 text-black' : 'border-glow-blue text-electric-blue'}
                  variant={selectedAction === 'fertilizer' ? 'default' : 'outline'}
                  size="sm"
                >
                  Fert ({gameState.fertilizer})
                </Button>
                <Button
                  onClick={() => setSelectedAction(selectedAction === 'pesticide' ? null : 'pesticide')}
                  className={selectedAction === 'pesticide' ? 'bg-red-500 text-black' : 'border-glow-blue text-electric-blue'}
                  variant={selectedAction === 'pesticide' ? 'default' : 'outline'}
                  size="sm"
                >
                  Pest ({gameState.pesticide})
                </Button>
                <Button
                  onClick={() => setSelectedAction(selectedAction === 'harvest' ? null : 'harvest')}
                  className={selectedAction === 'harvest' ? 'bg-purple-500 text-black' : 'border-glow-blue text-electric-blue'}
                  variant={selectedAction === 'harvest' ? 'default' : 'outline'}
                  size="sm"
                >
                  Colher
                </Button>
              </div>

              <div className="p-4 border-glow-blue rounded text-center text-electric-blue font-bold">
                {gameState.message}
              </div>
            </div>

            <div className="space-y-3">
              <Card className="border-glow p-4">
                <h3 className="text-sm font-bold text-green-400 mb-3">Recursos</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Dinheiro:</span>
                    <span className="font-bold text-green-400">${gameState.money}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agua:</span>
                    <span className="font-bold text-blue-400">{gameState.water}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solo:</span>
                    <span className="font-bold text-green-400">{gameState.soil_health}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biodiv:</span>
                    <span className="font-bold text-purple-400">{gameState.biodiversity}%</span>
                  </div>
                </div>
              </Card>

              <Card className="border-glow p-4">
                <h3 className="text-sm font-bold text-yellow-400 mb-3">Pontuacao</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-yellow-400">{gameState.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Colhidas:</span>
                    <span className="font-bold text-green-400">{gameState.totalHarvested}</span>
                  </div>
                </div>
              </Card>

              <Card className="border-glow p-4">
                <h3 className="text-sm font-bold text-electric-blue mb-3">Plantacoes ({gameState.crops.length})</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                  {gameState.crops.length === 0 ? (
                    <div className="text-muted-foreground">Nenhuma plantacao</div>
                  ) : (
                    gameState.crops.map((crop) => (
                      <div key={crop.id} className="border-l-2 border-green-400 pl-2">
                        <div className="font-bold">{crop.type} - {crop.health}%</div>
                        <div className="text-muted-foreground">Idade: {crop.age}</div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Button
                onClick={nextSeason}
                disabled={gameState.gameOver}
                className="w-full bg-electric-blue hover:bg-blue-600 text-black font-bold"
              >
                Proxima Estacao
              </Button>

              {gameState.gameOver && (
                <Card className="border-glow-blue p-4 text-center">
                  <h3 className="text-lg font-bold text-green-400 mb-2">Jogo Finalizado!</h3>
                  <p className="text-muted-foreground mb-3 text-sm">Pontuacao Final:</p>
                  <p className="text-2xl font-bold text-yellow-400 mb-4">{gameState.score}</p>
                  <Button
                    onClick={resetGame}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Jogar Novamente
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}