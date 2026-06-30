<script lang="ts" src="./App.ts" />

<template>
  <ToastProvider>
    <div id="app">
      <main>
        <RouterView />
      </main>
    </div>
    <ConfirmModalProvider />
  </ToastProvider>
</template>
