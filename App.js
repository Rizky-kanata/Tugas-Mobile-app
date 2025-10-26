import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
  useColorScheme,
} from "react-native";

export default function App() {
  const [coins, setCoins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshAnim] = useState(new Animated.Value(0));
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [amount, setAmount] = useState("");

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = {
    bg: isDark
      ? "linear-gradient(135deg, #0F2027, #203A43, #2C5364)"
      : "linear-gradient(135deg, #E0EAFC, #CFDEF3)",
    card: isDark ? "#1E293BCC" : "#FFFFFFCC",
    text: isDark ? "#E0F7FA" : "#111827",
    sub: isDark ? "#94E2FF" : "#6B7280",
    accent: "#3B82F6",
    positive: "#22C55E",
    negative: "#EF4444",
    glow: "#3B82F6",
  };

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false"
      );
      const data = await res.json();
      setCoins(data);
      setFiltered(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const animateRefresh = () => {
    refreshAnim.setValue(0);
    Animated.timing(refreshAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => fetchCoins());
  };

  const rotate = refreshAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const searchCoin = (text) => {
    setSearch(text);
    if (!text) setFiltered(coins);
    else {
      const filteredData = coins.filter((coin) =>
        coin.name.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(filteredData);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            shadowColor: theme.glow,
            shadowOpacity: 0.7,
            shadowRadius: 10,
            borderWidth: 1,
            borderColor: theme.glow + "55",
          },
        ]}
        onPress={() => {
          setSelectedCoin(item);
          setAmount("");
        }}
      >
        <Image source={{ uri: item.image }} style={styles.logo} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.symbol, { color: theme.sub }]}>
            {item.symbol.toUpperCase()}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: theme.text }]}>
            ${item.current_price.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.change,
              { color: item.price_change_percentage_24h >= 0 ? theme.positive : theme.negative },
            ]}
          >
            {item.price_change_percentage_24h.toFixed(2)}%
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Text style={[styles.favorite, { color: theme.glow }]}>
            {isFav ? "⭐" : "☆"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const totalValue = selectedCoin && amount ? selectedCoin.current_price * parseFloat(amount || 0) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.glow }]}>💰 CryptoTracker</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <TouchableOpacity style={[styles.refreshBtn, { borderColor: theme.glow }]} onPress={animateRefresh}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.glow }]}
        placeholder="Cari koin..."
        placeholderTextColor={theme.sub}
        value={search}
        onChangeText={searchCoin}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.glow} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <Text style={[styles.footer, { color: theme.sub }]}>Data Real-Time dari CoinGecko API</Text>

      {/* Modal futuristik */}
      <Modal visible={!!selectedCoin} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.glow, borderWidth: 1 }]}>
            {selectedCoin && (
              <>
                <Image source={{ uri: selectedCoin.image }} style={{ width: 80, height: 80 }} />
                <Text style={[styles.name, { color: theme.text, fontSize: 22, marginTop: 10 }]}>{selectedCoin.name}</Text>
                <Text style={{ color: theme.sub }}>{selectedCoin.symbol.toUpperCase()}</Text>
                <Text style={[styles.price, { color: theme.text, marginTop: 10 }]}>
                  ${selectedCoin.current_price.toLocaleString()}
                </Text>
                <Text style={{ color: selectedCoin.price_change_percentage_24h >= 0 ? theme.positive : theme.negative, fontSize: 16 }}>
                  {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                </Text>

                <TextInput
                  style={[styles.input, { borderColor: theme.glow, color: theme.text }]}
                  placeholder="Jumlah koin..."
                  placeholderTextColor={theme.sub}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(val) => setAmount(val)}
                />

                {amount > 0 && (
                  <Text style={[styles.totalText, { color: selectedCoin.price_change_percentage_24h >= 0 ? theme.positive : theme.negative }]}>
                    💵 Total: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                )}

                <TouchableOpacity style={[styles.closeBtn, { borderColor: theme.glow }]} onPress={() => setSelectedCoin(null)}>
                  <Text style={styles.refreshText}>Tutup</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 28, fontWeight: "bold", textShadowColor: "#3B82F6", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  refreshBtn: { padding: 10, borderRadius: 50, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  refreshText: { fontSize: 18, color: "#fff", textShadowColor: "#3B82F6", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  searchInput: { borderRadius: 12, padding: 10, marginBottom: 15, fontSize: 16, borderWidth: 1 },
  card: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 20, marginVertical: 8 },
  logo: { width: 50, height: 50, borderRadius: 25 },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "bold" },
  symbol: { fontSize: 14 },
  priceContainer: { alignItems: "flex-end", marginRight: 10 },
  price: { fontSize: 16, fontWeight: "bold" },
  change: { fontSize: 14, marginTop: 2 },
  footer: { textAlign: "center", fontSize: 12, marginTop: 10 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(15,23,42,0.85)" },
  modalContent: { padding: 20, borderRadius: 20, alignItems: "center", width: "80%" },
  closeBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 2, alignItems: "center" },
  input: { width: "80%", borderWidth: 2, borderRadius: 12, padding: 10, textAlign: "center", fontSize: 16, marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  favorite: { fontSize: 24, textShadowColor: "#3B82F6", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
});
