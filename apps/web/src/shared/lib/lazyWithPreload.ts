import {lazy, type ComponentType, type LazyExoticComponent} from 'react';

type ComponentModule<TProps> = {
  default: ComponentType<TProps>;
};

type PreloadableComponent<TProps> = LazyExoticComponent<ComponentType<TProps>> & {
  preload: () => Promise<ComponentModule<TProps>>;
};

/**
 * Component-level async boundary helper.
 *
 * - Route-level lazy에는 쓰지 않고 React Router `lazy`를 사용한다.
 * - Dynamic import target은 slice public API 또는 slice-local async entry에 한정한다.
 * - Consumer naming은 `FooAsync`, `preloadFoo()` 규칙을 따른다.
 */
function lazyWithPreload<TProps>(load: () => Promise<ComponentModule<TProps>>): PreloadableComponent<TProps> {
  let pendingModule: Promise<ComponentModule<TProps>> | undefined;

  function loadModule() {
    if (!pendingModule) {
      pendingModule = load().catch(error => {
        pendingModule = undefined;
        throw error;
      });
    }

    return pendingModule;
  }

  const LazyComponent = lazy(loadModule) as PreloadableComponent<TProps>;

  LazyComponent.preload = loadModule;

  return LazyComponent;
}

export {lazyWithPreload};
export type {PreloadableComponent};
