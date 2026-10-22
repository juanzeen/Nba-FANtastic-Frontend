export function Hero({
  totalTeams,
  totalRecords,
}: {
  totalTeams: number;
  totalRecords: number;
}) {
  const pillars = [
    {
      label: "Jogadores em Atividade",
      value: "400+",
      desc: "Estatísticas atualizadas em tempo real, projeções e histórico de temporadas",
      accent: false,
    },
    {
      label: "Franquias da NBA",
      value: totalTeams || 30,
      desc: "Classificadas por Power Score e saldo de eficiência",
      accent: true,
    },
    {
      label: "Lendas Históricas",
      value: "100+",
      desc: "Auges de carreira, títulos, MVPs e estatísticas por era",
      accent: false,
    },
    {
      label: "Recordes Oficiais",
      value: totalRecords || 23,
      desc: "Maiores marcas históricas, de temporada e em um único jogo",
      accent: true,
    },
  ];

  return (
      <section className="relative border border-neutral-200 shadow-xs rounded-3xl overflow-hidden px-6 py-12 sm:px-12">
        <div className="w-full mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-950 leading-[1.15]">
            Sua <span className="text-orange-600">central de dados</span> descomplicada da maior liga de basquete do
            mundo!
          </h2>

          <p className="w-9/10 mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed">
            O{" "}
            <strong className="text-neutral-950 font-bold">
              NBA FANtastic
            </strong>{" "}
            reúne métricas de jogadores em atividade, jogadores históricos e
            recordes da liga. Além disso, a plataforma conta com dados sobre as
            franquias da NBA, englobando informações avançadas de cada time e
            sincronizando esses dados com projeções estatísticas.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((item) => (
            <div
              key={item.label}
              className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 ">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      item.accent ? "text-orange-600" : "text-neutral-950"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      item.accent ? "bg-orange-500" : "bg-neutral-300"
                    }`}
                  />
                </div>
                <div
                  className={`text-3xl font-bold tracking-tight mt-2 ${
                    item.accent ? "text-orange-600" : "text-neutral-950"
                  }`}
                >
                  {item.value}
                </div>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mt-2">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

  );
}
