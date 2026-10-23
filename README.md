<div align="center">

<img src="docs/assets/icon-512.png" width="96" alt="">

# Free My TV

**Uma tela inicial rápida e sem anúncios para Google TV e para TVs LG e Samsung.**

Destaques do que está em alta nos seus próprios apps, o clima num relance e um visual que acompanha o pôr do sol.<br>
É código aberto, feito com o Claude Code, e um botão desfaz tudo.

[**freemytv.io**](https://freemytv.io) · [Instalar](#como-instalar) · [TVs LG](#tvs-lg-webos) · [TVs Samsung](#tvs-samsung-tizen) · [Qualquer TV](#qualquer-tv) · [Deixe do seu jeito](#deixe-do-seu-jeito)

<img src=".github/preview.webp" width="880" alt="A tela inicial do Free My TV: uma prateleira de vidro com os apps, os destaques do momento e uma gaveta com o clima e as cotações de cripto">

</div>

## O que você ganha

- Nenhum anúncio: sem fileiras patrocinadas, banners ou vídeos promocionais que começam sozinhos.
- Os apps que você usa ficam em primeiro plano, numa prateleira de vidro. Você escolhe quais e em que ordem, na própria TV.
- Os destaques vêm do que está em alta, não de quem pagou. São três sugestões novas por hora, entre o que está em alta na semana e os lançamentos, e só de apps que você já tem. Filmes e Séries têm abas próprias.
- Clima e mercado a um toque: a previsão hora a hora, o nascer e o pôr do sol e as cotações de cripto ao vivo.
- Claro de dia e escuro à noite, seguindo o pôr do sol real da sua cidade, como no celular.
- Um protetor de tela no mesmo estilo, com as fotos dos destaques em tela cheia e um relógio grande de vidro.
- Rápido: 60 fps, cada quadro em 16,6 ms, no próprio processador da TV. A tela inicial usa 96 MB de memória em vez de 242 MB (60% a menos).<br><sub>Medido numa TCL Google TV de 98″ com Android 14.</sub>
- Tudo se ajusta na TV, nas configurações do próprio Free My TV: idioma, cidade, temperatura, tema, os cartões de clima e cotações, quais moedas e os apps da prateleira.
- Seguro: não precisa de root e nada é desinstalado. Um botão traz de volta a tela inicial de fábrica.

## Como instalar

Leva uns dez minutos. Você precisa de uma Google TV ou Android TV (Android 8 ou mais novo) e de um computador na mesma rede Wi-Fi.

### O jeito fácil: com um assistente de IA

1. Na TV, ative o modo de desenvolvedor: Configurações → Sistema → Sobre → aperte *Android TV OS build* 7 vezes. Depois, em Configurações → Sistema → Opções do desenvolvedor, ative a **depuração USB**. Anote o endereço IP da TV (Configurações → Rede e Internet).
2. No computador, abra um assistente de programação com IA ([Claude Code](https://claude.com/claude-code), Codex ou Antigravity) e diga:
   > Install Free My TV (github.com/simbasjungles/free-my-tv) on my TV at 192.168.1.50. I live in Lisbon.

   Ele baixa o código, instala as ferramentas que faltam, monta o app e coloca na TV, e pergunta antes de qualquer passo importante. Troque pelo IP da sua TV e pela sua cidade.
3. Na TV, abra *Free My TV* → *Home Screen* → *Free My TV*. É aí que a TV pergunta *Allow USB debugging?* para o Free My TV: marque *Always allow* e aceite.

### O jeito manual

1. Na TV, faça o passo 1 acima.
2. Instale as ferramentas: um JDK (17 ou mais novo), as ferramentas de linha de comando do Android SDK (build-tools 34, platform android-34) e o adb. No Mac:
   ```bash
   brew install --cask temurin android-commandlinetools android-platform-tools
   sdkmanager "build-tools;34.0.0" "platforms;android-34"
   ```
   No Linux, instale o OpenJDK 17, as ferramentas de linha de comando do Android e o adb pelo gerenciador de pacotes, e rode a mesma linha do `sdkmanager`. No Windows, use o Git Bash (que é o que o Claude Code usa lá) ou o WSL.
3. Monte o app:
   ```bash
   ./build.sh
   ```
   A primeira execução cria o `config.properties`. Coloque nele a sua cidade e a sua [chave do TMDB](#a-chave-do-tmdb) e rode de novo.
4. Instale:
   ```bash
   adb connect 192.168.1.50:5555
   adb install -r FreeMyTV.apk
   ```
   Nas TVs TCL, permita também que ele rode em segundo plano. A TCL bloqueia isso por padrão, e sem essa permissão a troca de tela inicial nunca começa:
   ```bash
   adb shell "appops set io.freemytv AUTO_START allow || appops set io.freemytv APP_AUTO_START allow"
   ```
5. Na TV, abra *Free My TV* → *Home Screen* → *Free My TV*. A TV pergunta *Allow USB debugging?* mais uma vez, agora para o próprio Free My TV: marque *Always allow* e aceite.

## TVs LG (webOS)

É a mesma tela inicial, como um app da LG: os destaques, a prateleira de vidro com os seus apps, a gaveta com as entradas, o clima e as cotações, o dia e a noite, os Ajustes do Início e o editor da prateleira. A instalação usa o modo de desenvolvedor da própria LG, sem root e sem mudar nada na TV. A tela inicial da LG continua onde está, e o Free My TV fica a um toque de uma tecla numérica.

Você precisa de uma TV LG (webOS 3 ou mais novo) e de um computador na mesma rede Wi-Fi, com Python 3.

1. Na TV, abra a LG Content Store e instale o **Developer Mode**. Entre com uma [conta de desenvolvedor LG](https://webostv.developer.lge.com) gratuita, ative o **Dev Mode Status** (a TV reinicia) e depois o **Key Server**. Anote o endereço IP e a senha que aparecem.
2. No computador, baixe o código e monte o app. O `config.properties` funciona como no Google TV (sua cidade e sua [chave do TMDB](#a-chave-do-tmdb)):
   ```bash
   git clone https://github.com/simbasjungles/free-my-tv && cd free-my-tv
   python3 webos/build.py
   ```
3. Instale. Na primeira vez ele pede a senha da TV; nas atualizações, não:
   ```bash
   python3 webos/install.py 192.168.1.50
   ```
4. Na TV, com o Free My TV aberto, segure uma tecla numérica do controle. A partir daí, essa tecla abre o app de qualquer lugar.

Com um assistente de IA, diga *"Install Free My TV (github.com/simbasjungles/free-my-tv) on my LG TV at 192.168.1.50. I live in Lisbon."* Ele monta o app e te passa o comando de instalação, para você mesmo digitar a senha.

O modo de desenvolvedor dura uns 40 dias: abra o app Developer Mode de vez em quando e aperte **EXTEND**. Para remover o Free My TV, rode `python3 webos/install.py 192.168.1.50 --uninstall`.

## TVs Samsung (Tizen)

É a mesma tela inicial, como um app da Samsung, com tudo o que a versão LG tem: os destaques, a prateleira, a gaveta com as entradas, o clima e as cotações, o dia e a noite, e os próprios ajustes. A instalação usa o modo de desenvolvedor da própria Samsung, sem root e sem mudar nada na TV, e a tela inicial da Samsung continua onde está.

Você precisa de uma TV Samsung de 2017 ou mais nova (Tizen 3 ou mais) e de um computador na mesma rede Wi-Fi.

1. Na TV, abra **Apps** e digite `1 2 3 4 5` no controle. Ative o **Developer mode**, coloque o endereço IP do seu computador em **Host PC IP** e reinicie a TV.
2. No computador, baixe o [TizenBrew Installer](https://github.com/reisxd/TizenBrewInstaller/releases/latest), o instalador da comunidade para TVs Samsung, abra e conecte na sua TV.
3. Instale pelo GitHub: digite `simbasjungles/free-my-tv`. Nas TVs de 2023 em diante, ele pede para você entrar uma vez na sua conta Samsung, para assinar o app para a sua TV.
4. Para a TV já ligar no Free My TV: nas configurações da TV, em Opções da Tela Inicial, ative **Autorun Last App**.

Essa versão pega a cidade pelo fuso horário da TV. Para a sua cidade exata e para os destaques, monte o app com o seu próprio `config.properties` e a sua [chave do TMDB](#a-chave-do-tmdb): abra a pasta no Claude Code e diga *"Install Free My TV on my Samsung TV at 192.168.1.50. I live in Lisbon."* Ele prepara as ferramentas da Samsung, e nas TVs de 2023 em diante você entra na sua conta Samsung pelo navegador para gerar o certificado. A versão assinada instala com `python3 tizen/install.py 192.168.1.50`, que só precisa de Python: sem Tizen Studio, e sem Rosetta nos Macs com Apple Silicon.

Na LG e na Samsung, os Ajustes do Início têm 24 modos de tela, do Padrão ao Alto contraste, cada um com a própria paleta nos menus, no "Ver mais" e na gaveta.

## Ajustes

Os primeiros valores vêm do `config.properties`, criado na primeira montagem (Google TV, LG e Samsung usam o mesmo arquivo). A maioria também pode ser mudada na TV, em *Free My TV* → *Home Settings*, e o que você escolhe na TV prevalece:

| Chave | O que faz | Padrão |
|---|---|---|
| `tmdb_key` | Sua chave gratuita do TMDB, para os destaques | vazio |
| `tmdb_region` | Seu país (duas letras): quais títulos estão em qual app | `US` |
| `watchmode_key` | Opcional, chave gratuita do [Watchmode](https://api.watchmode.com/): o destaque abre a página do título no app | vazio |
| `latitude`, `longitude` | Sua cidade, para o clima e o pôr do sol | Nova York |
| `city` | O nome no cartão do clima | `Weather` |
| `hide_animation` | Deixa desenhos e animes fora dos destaques | `false` |
| `language` | `auto` (segue a TV) ou um idioma que tenha [tradução](#idiomas) (`en`, `pt`, `es`, `de`, `ru`, `fr`, `ja`…) | `auto` |
| `show_crypto` | Mostra as cotações de cripto da Binance na tela inicial e no protetor de tela | `true` |
| `currency` | Cotações em `USD`, `EUR`, `BRL`… | `USD` |
| `temperature` | `C`, `F` ou `auto` | `auto` |
| `disable_assistant` | Desliga também o Google Assistente | `false` |
| `hide_services` | Serviços de streaming que ficam fora dos destaques mesmo com o app na TV (`netflix`, `prime`, `disney`…), separados por vírgula; para apps que vêm na TV e que você não assina. Só no Google TV | vazio |
| `hide_apps` | Apps que ficam fora da prateleira, do Todos os Apps e dos destaques, pelo id ou pelo nome (ou parte dele), separados por vírgula; para apps que vêm na TV e não dá para desinstalar, como o Netflix embutido da Samsung. Só na LG e na Samsung | vazio |

Mudou alguma coisa? Rode `./build.sh` e instale de novo. Guarde o `freemytv.keystore`: as atualizações são assinadas com ele.

### A chave do TMDB

É gratuita e leva dois minutos: crie uma conta em [themoviedb.org](https://www.themoviedb.org/signup), abra [Settings → API](https://www.themoviedb.org/settings/api) e peça uma chave de desenvolvedor. Cole o *API Read Access Token* (ou a *API Key*) depois de `tmdb_key=`. A chave é sua: o `config.properties` fica fora do git.

### Abrir o título, e não só o app (opcional)

Com uma chave gratuita do [Watchmode](https://api.watchmode.com/) (`watchmode_key=` no `config.properties`), o destaque abre a página dele no app de streaming em vez do início do app. O plano gratuito (2.500 créditos por mês) basta: cada título custa duas consultas na primeira vez e depois fica guardado. Funciona onde o app aceita o endereço web do título (testado no Prime Video e no JioHotstar); onde não aceita, o destaque só abre o app, como sem a chave.

## Para voltar

Na TV: *Free My TV* → *Home Screen* → *Original*. A tela inicial de fábrica, o protetor de tela e todos os apps voltam exatamente como estavam. Se a nova tela inicial travar três vezes em cinco minutos, ela volta sozinha.

Para remover de vez, troque para *Original* primeiro e depois desinstale o *Free My TV* (Configurações → Apps). Desinstalou com ele ligado? Instale de novo e escolha *Original*: a lista do que ele desligou fica guardada nas configurações da TV, então tudo volta.

## O que ele muda

- Vira a tela inicial e o protetor de tela.
- Desliga, sem desinstalar:
  - a tela inicial e o protetor de tela de fábrica;
  - a tela inicial de recuperação do Google TV, o Play Games e o YouTube Music;
  - nas TVs TCL, o TCL Channel, as mensagens, a demonstração de loja, o menu de hotel, os manuais, o espelhamento e os apps de registro;
  - nas TVs Philco, o AI PONT (canais promocionais e downloads de apps) e o manual;
  - nas TVs Multilaser, o reconhecimento de conteúdo da tela (ACR) da Anoki, a demonstração de loja e o manual;
  - nas TVs feitas pela KTC (NextStar), o reconhecimento de conteúdo da tela (ACR) da Anoki, a demonstração de loja e o manual;
  - o Google Assistente, só com `disable_assistant=true`.
- Nas TVs TCL, os botões Netflix, YouTube e Prime do controle continuam funcionando por um pequeno serviço de acessibilidade que só lê esses botões. Você escolhe o que cada um abre em *Free My TV* → *Remote Buttons*, e *Original* desliga o serviço. Nas TVs feitas pela Vestel (F&U e outras marcas de loja) e nos projetores Xiaomi (Formovie) vale o mesmo para o botão Netflix, e nas TVs feitas pela KTC (NextStar), para o botão Tabii. Nas TVs Sony, os botões BRAVIA CORE, Netflix, Disney+, Prime Video, YouTube e Crunchyroll (e o Google Play, nos controles que têm) podem abrir o app que você escolher ou manter o padrão da Sony.
- Imagem, som, entradas, pareamento do controle, os serviços do Google e a Play Store estão numa lista protegida, conferida antes de cada mudança, assim como as partes do próprio Android e os menus de fábrica. Antes de desligar qualquer coisa, ele pergunta à TV se as entradas ou a tecla Input do controle dependem daquilo; o que depende fica ligado.
- No Google TV, o app de configuração inicial é desligado antes da tela inicial de fábrica e volta depois dela, para que a tela de recuperação dele nunca tome o botão Home no meio do caminho.
- Apps que salvaram uma rede Wi-Fi nunca são desligados, porque o Android apagaria a rede. Se a configuração inicial da TV salvou a sua, a troca pede para você esquecer a rede e conectar de novo nas Configurações primeiro (redes salvas fora de alcance não aparecem lá; o Claude Code consegue removê-las).

## Qualquer TV

O Free My TV roda em Google TV e Android TV: TCL, Sony, Hisense, Philips, Xiaomi, TVs feitas pela Vestel (F&U), TVs feitas pela KTC (NextStar) e outras, além de aparelhos como o Chromecast com Google TV, o Google TV Streamer, o onn 4K e o NVIDIA Shield. E nas TVs [LG](#tvs-lg-webos) e [Samsung](#tvs-samsung-tizen), como app.

Em qualquer outra TV, ligue um aparelho com Google TV na HDMI e liberte esse. São os mesmos passos e a mesma tela inicial.

Se a sua marca ou modelo é diferente, peça ao Claude. O Free My TV foi feito para ser adaptado por IA: abra a pasta no Claude Code e diga *"set it up for my Sony"*. Ele lê a sua TV, encontra a tela inicial e os apps promocionais dela, atualiza as listas abaixo e te guia num teste. O [CLAUDE.md](CLAUDE.md) explica como.

| O quê | Onde |
|---|---|
| Apps para desligar | `DEBLOAT` em [`HomeMode.java`](app/src/io/freemytv/HomeMode.java) |
| Apps que nunca são mexidos | `PROTECTED` no mesmo arquivo |
| Apps na prateleira | `SHELF` em [`HomeApps.java`](app/src/io/freemytv/HomeApps.java) |
| O app de TV ao vivo da sua marca | `LIVE_TV_APPS` no mesmo arquivo |

## Deixe do seu jeito

O código é seu, e o Claude Code se acha nele. Experimente pedir:

- *"Add Crunchyroll to the shelf."*
- *"Show the prices in euros."*
- *"Add Catalan."*
- *"Switch to the night look an hour after sunset."*

## Como funciona

- É um app Android simples, sem Gradle e sem bibliotecas. O [`build.sh`](build.sh) roda aapt2 → javac → d8 → zipalign → apksigner e gera um APK de 2 MB.
- Usa o ADB da própria TV, de dentro da TV. O app se conecta em `127.0.0.1:5555` com a própria chave (é daí que vem a pergunta *Allow USB debugging?*) e roda os mesmos comandos que você rodaria: `cmd package set-home-activity`, `settings put secure screensaver_components`, `pm disable-user`. Nada fica escutando na rede.
- A tela é desenhada à mão num único Canvas, com shaders do Android 13 para o vidro fosco e o céu (cores sólidas do Android 8 ao 12, com sombras mais leves e sem camadas de GPU do 8 ao 11, por causa das GPUs mais antigas).
- Tem uma rede de segurança: um watchdog num processo separado traz de volta a tela inicial de fábrica depois de três travamentos em cinco minutos, e uma verificação na inicialização mantém a sua escolha depois de atualizações da TV.
- Na LG e na Samsung, o mesmo design é feito em HTML, CSS e JavaScript simples ([`web/`](web)), escrito para o Chromium das TVs mais antigas, sem frameworks. O [`webos/build.py`](webos/build.py) empacota tudo com o `config.properties` num `.ipk` sem as ferramentas da LG, e o [`webos/install.py`](webos/install.py) instala pelo modo de desenvolvedor; na LG, ele lista e abre os apps pelo barramento de serviços da própria TV (Luna), como o launcher da LG faz. O [`tizen/build.py`](tizen/build.py) empacota o mesmo app num `.wgt` da Samsung, que usa as APIs web do Tizen para os apps e as entradas. Para ver no computador: `python3 webos/build.py --preview`, e depois abra `out/webos/index.html` (uma lista de apps de exemplo faz o papel da TV).
- Os dados vêm do TMDB (títulos em alta, lançamentos e qual app transmite o quê no seu país), do Open-Meteo (previsão, nascer e pôr do sol) e, se quiser, da Binance (preços das últimas 24 horas, com `show_crypto=true`).

| Arquivo | O que é |
|---|---|
| [`HomeView.java`](app/src/io/freemytv/HomeView.java) | A tela inicial |
| [`HomeMode.java`](app/src/io/freemytv/HomeMode.java) | A troca entre o Free My TV e o Original |
| [`Adb.java`](app/src/io/freemytv/Adb.java) | O ADB da própria TV, de dentro da TV |
| [`Recs.java`](app/src/io/freemytv/Recs.java) | Os destaques (TMDB) |
| [`HomeData.java`](app/src/io/freemytv/HomeData.java) | Clima e cotações |
| [`HomeApps.java`](app/src/io/freemytv/HomeApps.java) | A prateleira, as entradas e o Todos os Apps |
| [`DreamView.java`](app/src/io/freemytv/DreamView.java) | O protetor de tela |
| [`SettingsActivity.java`](app/src/io/freemytv/SettingsActivity.java) | A tela de configurações (o ícone do app) |
| [`Prefs.java`](app/src/io/freemytv/Prefs.java) | Os ajustes mudados na TV |
| [`RemoteKeys.java`](app/src/io/freemytv/RemoteKeys.java) | Os botões de apps do controle da TCL |
| [`Watchdog.java`](app/src/io/freemytv/Watchdog.java) | A rede de segurança |
| [`web/home.js`](web/home.js) | A tela inicial na LG e na Samsung |
| [`web/tv.js`](web/tv.js) | Os apps e as entradas da TV, na LG e na Samsung |
| [`webos/build.py`](webos/build.py), [`webos/install.py`](webos/install.py) | O pacote do app LG e a instalação dele |
| [`tizen/build.py`](tizen/build.py) | O pacote do app Samsung |

O site ([freemytv.io](https://freemytv.io)) fica em [`docs/`](docs): HTML, CSS e JS simples no GitHub Pages.

## Idiomas

No Google TV, na LG e na Samsung, cada idioma é um arquivo, [`app/assets/i18n/<idioma>.json`](app/assets/i18n), com o texto em inglês do código como chave. O *Automático* segue o idioma da TV e usa qualquer idioma que tenha arquivo (senão, inglês); em *Ajustes do Início* → *Idioma* aparecem todos. Hoje são: inglês, português, espanhol, alemão, francês, italiano, holandês, polonês, sueco, dinamarquês, norueguês, finlandês, tcheco, romeno, turco, russo, ucraniano, grego, japonês, coreano, chinês simplificado, hindi, indonésio, vietnamita e tailandês. Português, espanhol, alemão, russo e tailandês foram traduzidos à mão e são a referência (corrija à mão); os outros foram feitos por máquina, e correções de quem fala o idioma são bem-vindas.

- Para adicionar um idioma: `python3 tools/translate.py --new ca`, e depois preencha `app/assets/i18n/ca.json` à mão, ou, com `ANTHROPIC_API_KEY` definida, `python3 tools/translate.py --fill --lang ca` (só os textos vão para a API).
- Depois de mudar algum texto no código: `python3 tools/translate.py` lista o que falta em cada idioma; `--fill` traduz só isso, e `--prune` tira os textos que o código não usa mais. Rode `python3 tools/translate.py --check` para validar todos os catálogos sem gravar nada.
- Texto montado na hora tem marcadores (`"{n} min ago"`), para cada idioma pôr as palavras na sua ordem. Uma chave como `"unit|Automatic"` é o mesmo texto em inglês usado em outro lugar, onde um idioma pode precisar de outra palavra.
- Contagens têm formas de plural: `"plural|one:{n} season|other:{n} seasons"` é traduzido com uma forma para cada categoria de plural do idioma (no russo, `"one:{n} сезон|few:{n} сезона|many:{n} сезонов|other:{n} сезона"`; no japonês, só `"other:{n}シーズン"`), e as regras de plural do Android escolhem a certa para cada número.
- Limites: idiomas da direita para a esquerda (árabe, hebraico, persa) precisariam do layout espelhado, por isso ainda não estão lá. Chinês, japonês, coreano e hindi usam a fonte do sistema da TV (a Inter não tem essas letras).

## Privacidade

Sem contas, sem análise de uso, sem rastreamento. O app conversa com o TMDB, com o Open-Meteo (com as coordenadas que você definiu, ou com a cidade principal do seu fuso horário), com a Binance só com `show_crypto=true`, e com o Watchmode só se você definir uma `watchmode_key`. Seus ajustes ficam no seu computador e na sua TV.

## Créditos

- Feito com o [Claude Code](https://claude.com/claude-code).
- A versão LG parte do que [@danielthejoker18](https://github.com/danielthejoker18) descobriu no [FreeMyTvWebOS](https://github.com/danielthejoker18/FreeMyTvWebOS) (MIT): a instalação pelo modo de desenvolvedor e a abertura de apps pelo barramento de serviços da TV.
- Nas TVs Samsung, a instalação usa o [TizenBrew Installer](https://github.com/reisxd/TizenBrewInstaller), de [@reisxd](https://github.com/reisxd).
- Este produto usa a API do TMDB, mas não é endossado nem certificado pelo [TMDB](https://www.themoviedb.org/).
- Os links para os títulos nos apps de streaming são do [Watchmode](https://api.watchmode.com/).
- Dados do clima do [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0). Cotações da API pública da [Binance](https://www.binance.com/).
- Ícones: [Material Symbols](https://fonts.google.com/icons) (Apache 2.0). Fonte: [Inter](https://rsms.me/inter/) (SIL OFL 1.1). Logos das moedas: [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons) (CC0). Logos dos apps na Samsung: [Simple Icons](https://simpleicons.org) (CC0).
- Sem vínculo com Google, TCL, LG, Samsung ou qualquer serviço de streaming. Os nomes e logos dos apps pertencem aos seus donos.

## Licença

[MIT](LICENSE). Faça um fork, mude e publique.
