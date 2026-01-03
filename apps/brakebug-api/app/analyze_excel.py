# analyze_excel.py (refatorado)
import pandas as pd
import os

def analyze_excel(file_path):
    """
    Lê um arquivo Excel de um caminho fornecido e retorna informações de análise.

    Args:
        file_path (str): O caminho completo para o arquivo Excel a ser lido.

    Returns:
        dict: Um dicionário contendo 'columns' (lista de colunas) e 'head' (primeiras 5 linhas),
              ou 'error' se a leitura falhar.
    """
    # Verifica se o arquivo existe para evitar erros antes de tentar ler.
    if not os.path.exists(file_path):
        return {"error": f"Erro: O arquivo não foi encontrado no caminho especificado: {file_path}"}
        
    try:
        # Lê o arquivo Excel usando o caminho fornecido.
        df = pd.read_excel(file_path)
        
        # Converte as primeiras 5 linhas para um formato JSON/dict
        preview_data = df.head().to_dict(orient='records')

        return {
            "columns": df.columns.tolist(),
            "head": preview_data
        }

    except Exception as e:
        return {"error": f"Erro ao ler o arquivo Excel: {e}"}

# Exemplo de como usar a função (isso só será executado se o arquivo for rodado diretamente)
if __name__ == "__main__":
    # IMPORTANTE: Para testes, você precisará fornecer um caminho de arquivo válido aqui.
    # Esta parte é apenas para demonstração do uso da função.
    excel_file_path = "caminho/para/seu/arquivo/Exemplo-TesteAPI.xlsx"
    analysis_result = analyze_excel(excel_file_path)

    if "error" in analysis_result:
        print(analysis_result["error"])
    else:
        print("Análise concluída com sucesso!")
        print("\nColunas encontradas:")
        print(analysis_result["columns"])
        print("\nPrimeiras 5 linhas:")
        print(pd.DataFrame(analysis_result["head"]).to_string())

