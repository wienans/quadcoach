# QuadCoach Client App

## React functional components

For now we would use following structures and guidance for react functional components:

- each component should be stored in one file
- each component file should have a default export
- directories should have index file exporting values needed outside
- components should be if possible functional components instead of class components
- functional components without properties should look like:

  ```typescript
  const MyComponent = (): JSX.Element => {
    const a = 1 + 1;
    return <p>{a}</p>;
  };

  export default MyComponent;

  // Also possible if only JSX returned without needed variables inside
  const MyComponent = (): JSX.Element => <p>Hallo</p>;

  export default MyComponent;
  ```

  Hint: if you want to write quick such component, type FuCo and use autocompletion.

- functional components with properties should look like:

  ```typescript
  export type MyComponentProps = {
    myProperty: string;
  };

  const MyComponent = ({ myProperty }: MyComponentProps): JSX.Element => {
    const a = 1 + 1;
    return <p>{`${a} ${myProperty}`}</p>;
  };

  export default MyComponent;

  // Same like for component without properties, we could simplify if possible

  export type MyComponentProps = {
    myProperty: string;
  };

  const MyComponent = ({ myProperty }: MyComponentProps): JSX.Element => (
    <p>{myProperty}</p>
  );

  export default MyComponent;
  ```

  In general if properties is simple we would use type for the Props type. If some extending or else would be possible, we would use interface

  ```typescript
  export type A = {
    test: string;
  };

  export interface B extends A {
    testTwo: number;
  }
  ```

  Hint: if you want to write quick such component, type FuCoProps and use autocompletion.

## Translations

For translations we are using i18next or rather react-i18next library for translations. Its documentation can be found [here](https://react.i18next.com/).
Standard configuration of i18next is located at src/i18n/index. This file needs to be imported before components with their translations are imported or rather i18next.addResourceBundle is called. That's why it is imported inside main.ts at first.

For translations create a new folder called translations, add for every supported language one json file called component_languageKey.json and one index.ts file.
Content of index.ts would be 
```typescript
  import i18next from "i18next";
  import de from "./yourComponent_de.json";
  import en from "./yourComponent_en.json";
  // more languages...

  const namespace = "YourNamespace";

  i18next.addResourceBundle("de", namespace, de);
  i18next.addResourceBundle("en", namespace, en);
  // more languages...
```
, which can be generated using vs code snippet with prefix "translationsIndex".

Jsons would look like
```json
{
  "firstKey": "My test",
  "secondKey": {
    "nestedKey": "Blub"
  },
  "withParameter": "Wert: {{parameter}}"
}
```

Inside component, for which the translations are, import at first line the translations index file. 
To use translations we use the useTranslation hook, other ways you could read in the documentation.
So inside your component at the begining write ```const { t } = usetTranslation("YourNamespace")```
and then you could use it inside JSX code like  
```JSX
<span>{t("YourNamespace:firstKey")}</span>
<span>{t("YourNamespace:secondKey.nestedKey")}</span>
<span>{t("YourNamespace:withParameter", {parameter: 0})}</span>
```

Inside application language could be changed inside DashboardNavbar, which uses i18n.changeLanguage(languageCode), whereby i18n could be also deconstructed from useTranslations hook.

**Hint:** Mostly we create for every component one translations folder and its translations, but it could be also sensful to create only translation folder and translation with nested properties if some small components would only have two translation values.

## Redux Toolkit

Information about Redux Toolkit could be found [here](https://redux-toolkit.js.org/introduction/getting-started).

For our development we would use following guideline:

- Instead of useSelector from react-redux, we use useAppSelector from ./src/store/hooks, because it is already typed:

  ```typescript
  // use this
  import { useAppSelector } from "./store/hooks";
  const miniSidenav = useAppSelector((state) => state.layout.miniSidenav);

  // and not use this, because it wants to have (state: RootState) else it throws warning "Parameter 'state' implicitly has an 'any' type.ts(7006)" => less typing ;-)
  import { useSelector } from "react-redux";
  const test = useSelector((state) => state.layout.miniSidenav);
  ```

- Like for useSelector, we would use useAppDispatch from ./src/store/hooks instead of useDispatch from react-redux. Because it is also typed instead of normal useDispatch.

  ```typescript
  // use this
  import { useAppDispatch } from "../../store/hooks";
  const dispatch = useAppDispatch();

  // and not use this
  import { useDispatch } from "react-redux";
  const dispatch = useDispatch();
  ```

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## FavIcon 
FavIcon was created by using [realfavicongenerator](https://realfavicongenerator.net/).

# License

This Front-End is based on the [SoftUI Version 4.0.1](https://github.com/creativetimofficial/soft-ui-dashboard-react/tree/4.0.1) by [Creative Tim under MIT LICENSE](./LICENSE-Creative-Tim.md). The Software was changed, extended and refactored and all Changes are Licensed under the [Repository License](../LICENSE)
