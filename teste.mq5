//+------------------------------------------------------------------+
//| chatgpt.mq5                                                      |
//+------------------------------------------------------------------+
#property strict
#include <Trade/Trade.mqh>

input string BACKEND_URL = "http://127.0.0.1:3000/mt5/decision";
input int TIMER_SEC = 10;
input int CANDLES_QTY = 50;
input double DEFAULT_LOT = 0.10;

CTrade trade;

//------------ PROTÓTIPOS ------------
string BuildJson(MqlTick &tick, MqlRates &rates[], const int count);
string JsonGet(const string json, const string key);
string Trim(const string s);
void ParseAndAct(const string resp);

//------------ CICLO EA --------------
int OnInit()
{
   EventSetTimer(TIMER_SEC);
   Print("EA inicializado. Timer=", TIMER_SEC, "s");
   return (INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
   EventKillTimer();
}

void OnTimer()
{
   MqlTick tick;
   if (!SymbolInfoTick(_Symbol, tick))
   {
      Print("Erro ao obter tick");
      return;
   }

   MqlRates rates[];
   int copied = CopyRates(_Symbol, PERIOD_M1, 0, CANDLES_QTY, rates);
   if (copied <= 0)
   {
      Print("Erro ao copiar candles: ", GetLastError());
      return;
   }

   string json = BuildJson(tick, rates, copied);

   // --- WebRequest ---
   string headers = "Content-Type: application/json\r\n";
   uchar post[];
   uchar result[];
   string result_headers;

   StringToCharArray(json, post);

   int code = WebRequest("POST", BACKEND_URL, headers, 5000, post, result, result_headers);
   if (code != 200)
   {
      PrintFormat("WebRequest falhou. HTTP=%d  LastError=%d", code, GetLastError());
      return;
   }

   string resp = CharArrayToString(result, 0, -1, CP_UTF8);
   ParseAndAct(resp);
}

//------------ FUNÇÕES AUX -----------
string BuildJson(MqlTick &tick, MqlRates &rates[], const int count)
{
   string json = "{";
   json += StringFormat("\"symbol\":\"%s\",", _Symbol);
   json += StringFormat("\"bid\":%.5f,\"ask\":%.5f,", tick.bid, tick.ask);
   json += "\"candles\":[";
   for (int i = 0; i < count; i++)
   {
      if (i > 0)
         json += ",";
      long t = (long)rates[i].time;
      json += StringFormat("{\"t\":%I64d,\"o\":%.5f,\"h\":%.5f,\"l\":%.5f,\"c\":%.5f,\"v\":%d}",
                           t,
                           rates[i].open, rates[i].high, rates[i].low, rates[i].close,
                           (int)rates[i].tick_volume);
   }
   json += "]}";
   return json;
}

// Busca valor simples no JSON (sem aninhamento complexo)
string JsonGet(const string json, const string key)
{
   string pat = "\"" + key + "\"";
   int pos = StringFind(json, pat);
   if (pos == -1)
      return "";
   pos = StringFind(json, ":", pos);
   if (pos == -1)
      return "";
   pos++;

   while (pos < StringLen(json) && StringGetCharacter(json, pos) == ' ')
      pos++;

   bool quoted = (StringGetCharacter(json, pos) == '\"');
   if (quoted)
      pos++;

   int start = pos;
   if (quoted)
   {
      while (pos < StringLen(json) && StringGetCharacter(json, pos) != '\"')
         pos++;
      return StringSubstr(json, start, pos - start);
   }
   else
   {
      while (pos < StringLen(json))
      {
         int ch = StringGetCharacter(json, pos);
         if (ch == ',' || ch == '}' || ch == ' ' || ch == '\r' || ch == '\n')
            break;
         pos++;
      }
      return StringSubstr(json, start, pos - start);
   }
}

string Trim(const string s)
{
   string t = s;
   StringTrimLeft(t);
   StringTrimRight(t);
   return t;
}

void ParseAndAct(const string resp)
{
   string action = Trim(JsonGet(resp, "action"));
   if (action == "")
   {
      Print("JSON sem 'action': ", resp);
      return;
   }

   double lot = StringToDouble(JsonGet(resp, "lot"));
   if (lot <= 0)
      lot = DEFAULT_LOT;

   double sl = StringToDouble(JsonGet(resp, "sl"));
   double tp = StringToDouble(JsonGet(resp, "tp"));

   if (action == "BUY")
   {
      if (trade.Buy(lot, _Symbol, 0, sl, tp))
         Print("BUY enviado. lot=", lot, " sl=", sl, " tp=", tp);
      else
         Print("Falha BUY: ", GetLastError());
   }
   else if (action == "SELL")
   {
      if (trade.Sell(lot, _Symbol, 0, sl, tp))
         Print("SELL enviado. lot=", lot, " sl=", sl, " tp=", tp);
      else
         Print("Falha SELL: ", GetLastError());
   }
   else
   {
      Print("Ação recebida: ", action, " (nenhuma ordem enviada)");
   }
}
