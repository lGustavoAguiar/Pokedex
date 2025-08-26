# Pokédex Frontend

Uma aplicação React moderna para visualizar Pokémons, conectada ao seu backend personalizado.

## 🚀 Funcionalidades

- ✅ Listagem de Pokémons (20 por página)
- ✅ Sistema de paginação
- ✅ Busca por nome ou ID
- ✅ Design responsivo
- ✅ Integração com backend personalizado
- ✅ Interface moderna e intuitiva

## 🛠️ Tecnologias Utilizadas

- **React 19** - Biblioteca para interface de usuário
- **Vite** - Ferramenta de build rápida
- **CSS3** - Estilização moderna com gradientes e animações
- **Fetch API** - Para comunicação com o backend

## ⚙️ Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure a URL do seu backend:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Executar o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🔌 Configuração do Backend

O frontend espera que seu backend tenha os seguintes endpoints:

### Listar Pokémons (com paginação)
```
GET /api/pokemon?page=1&limit=20
```

**Resposta esperada:**
```json
{
  "pokemon": [
    {
      "id": 1,
      "name": "bulbasaur",
      "types": ["grass", "poison"],
      "image": "url_da_imagem"
    }
  ],
  "totalPages": 66,
  "currentPage": 1,
  "totalCount": 1302
}
```

### Buscar Pokémons
```
GET /api/pokemon/search?q=pikachu&page=1&limit=20
```

**Resposta esperada:** (mesmo formato da listagem)

## 📱 Design Responsivo

- **Desktop:** Grid de 4-5 colunas
- **Tablet:** Grid de 2-3 colunas  
- **Mobile:** Grid de 1-2 colunas

## 🎨 Personalização

### Cores dos Tipos de Pokémon
As cores dos tipos são definidas no componente `PokemonCard.jsx` e podem ser personalizadas conforme necessário.

### Estilos Globais
Os estilos principais estão em:
- `src/App.css` - Layout principal e header
- `src/index.css` - Reset CSS e estilos base
- `src/components/*.css` - Estilos específicos dos componentes

## 📦 Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera a build para produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── PokemonCard.jsx  # Card individual do Pokémon
│   ├── PokemonGrid.jsx  # Grid de Pokémons
│   ├── SearchBar.jsx    # Barra de busca
│   └── Pagination.jsx   # Componente de paginação
├── data/
│   └── pokemonApi.js    # Funções para comunicação com backend
├── App.jsx              # Componente principal
├── App.css              # Estilos principais
└── main.jsx             # Ponto de entrada da aplicação
```

## 🤝 Integração com Backend

Para integrar com seu backend, certifique-se de que:

1. **CORS está configurado** para permitir requisições do frontend
2. **Endpoints seguem o formato esperado** mostrado acima
3. **Variável de ambiente VITE_API_URL** está configurada corretamente

## 📝 Próximos Passos

- [ ] Adicionar detalhes do Pokémon em modal/página separada
- [ ] Implementar favoritos
- [ ] Adicionar filtros por tipo
- [ ] Cache de requisições
- [ ] Modo offline

## 🐛 Solução de Problemas

### Erro de CORS
Se encontrar erros de CORS, configure seu backend para permitir requisições da origem do frontend.

### Pokémons não carregam
Verifique se:
1. A URL do backend está correta no `.env`
2. O backend está rodando
3. Os endpoints retornam o formato esperado

---

**Desenvolvido com ❤️ usando React + Vite**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
