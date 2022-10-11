import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalStorage, useAsyncFn } from "react-use";
import { format, formatISO } from "date-fns";
import { Icon, Card, DateSelect } from "~/components";
import axios from "axios";

export const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [currentDate, setDate] = useState(formatISO(new Date(2022, 10, 20)));
  const [auth, setAuth] = useLocalStorage("auth", {});

  const [user, fetchHunches] = useAsyncFn(async () => {
    const res = await axios({
      method: "get",
      baseURL: import.meta.env.VITE_API_URL,
      url: `/${params.username}`,
      params,
    });

    const hunches = res.data.hunches.reduce((acc, hunch) => {
      acc[hunch.gameId] = hunch;
      return acc;
    }, {});

    return {
      ...res.data,
      hunches,
    };
  });

  const [games, fetchGames] = useAsyncFn(async (params) => {
    const res = await axios({
      method: "get",
      baseURL: import.meta.env.VITE_API_URL,
      url: "/games",
    });
    return res.data;
  });

  const logout = () => {
    setAuth({});
    navigate("/login");
  };

  const isLoading = games.loading || user.loading;
  const hasError = games.error || user.error;
  const isDone = !isLoading && !hasError;

  useEffect(() => {
    fetchGames({ gameTime: currentDate });
    fetchHunches();
  }, []);

  return (
    <>
      <header className="bg-red-500 text-white">
        <div className="container max-w-3xl flex justify-between p-4">
          <img src="/imgs/logoo.svg" className="w-28 md:w-40" />
          {auth?.user?.id && (
            <div onClick={logout} className="p-2 cursor-pointer">
              Sair
            </div>
          )}
        </div>
      </header>

      <main className="space-y-6">
        <section id="header" className="bg-red-500 text-white">
          <div className="container max-w-3xl space-y-2 p-4">
            <a href="/dashboard">
              <Icon name="back" className="w-10" />
            </a>
            <h3 className="text-2xl font-bold">{user.name}</h3>
          </div>
        </section>

        <section id="content" className="container max-w-3xl p-4 space-y-4">
          <h2 className="text-red-500 text-xl font-bold">Seus palpites</h2>

          <DateSelect currentDate={currentDate} onChange={setDate} />

          <div className="space-y-4">
            {isLoading && "Carregando jogos..."}
            {hasError && "OPS! Algo deu errado."}

            {isDone &&
              games.value?.map((game) => (
                <Card
                  key={game.id}
                  gameId={game.id}
                  homeTeam={game.homeTeam}
                  awayTeam={game.awayTeam}
                  gameTime={format(new Date(game.gameTime), "H:mm")}
                  homeTeamScore={hunches?.value?.[game.id]?.homeTeamScore || ""}
                  awayTeamScore={hunches?.value?.[game.id]?.awayTeamScore || ""}
                  disabled={true}
                />
              ))}
          </div>
        </section>
      </main>
    </>
  );
};
