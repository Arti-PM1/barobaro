{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
   idx.previews = {
        enable = true;
        previews = {
          web = {
            # npm run dev 명령어를 자동으로 실행하라는 뜻입니다
            command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
            manager = "web";
      };
    };
  };
}