# backend/report_generator.py
import io
import matplotlib
matplotlib.use('Agg') # Use 'Agg' backend for non-interactive plotting
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import letter, A4, landscape # Importar landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.units import inch
from reportlab.lib.colors import black, blue, red, green, lightgrey, white

def generate_consumption_chart(consumption_data, median_data, months_labels, unit_name):
    """
    Gera um gráfico de linha do consumo da unidade vs. mediana do condomínio.
    Retorna o gráfico como um buffer de imagem PNG.
    """
    fig, ax = plt.subplots(figsize=(10, 4))
    
    ax.plot(months_labels, consumption_data, label=f'Consumo (m³)', marker='o', color='blue')
    ax.plot(months_labels, median_data, label='Mediana Condomínio (m³)', marker='x', linestyle='--', color='red')
    
    #ax.set_title(f'Consumo Mensal da Unidade {unit_name} vs. Mediana do Condomínio')
    #ax.set_xlabel('Mês')
    ax.set_ylabel('Consumo (m³)')
    ax.legend()
    ax.grid(True, axis='y', which='major', linestyle='-', alpha=0.7)
    plt.xticks(rotation=60, ha='right')
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=200)
    buf.seek(0)
    plt.close(fig)
    return buf

def create_unit_report_pdf(unit_data, chart_image_buffer):
    """
    Cria um relatório PDF para uma única unidade.
    unit_data: Dicionário contendo os dados pivotados da view.
    chart_image_buffer: Buffer de BytesIO contendo a imagem PNG do gráfico.
    Retorna um buffer de BytesIO contendo o PDF.
    """
    buffer = io.BytesIO()
    # Definir página como paisagem e margens mais estreitas
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), # landscape(A4) para orientação paisagem
                            rightMargin=0.5*inch, leftMargin=0.5*inch, # Margens mais estreitas
                            topMargin=0.5*inch, bottomMargin=0.5*inch) # Margens mais estreitas

    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(name='H1_Center', alignment=TA_CENTER, fontSize=10, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='H2_Left', alignment=TA_LEFT, fontSize=10, fontName='Helvetica', spaceAfter=6))
    styles.add(ParagraphStyle(name='Normal_Left', alignment=TA_LEFT, fontSize=8, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='Normal_Right', alignment=TA_RIGHT, fontSize=8, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='Cell_Center', alignment=TA_CENTER, fontSize=7, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='Cell_Left', alignment=TA_LEFT, fontSize=7, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='Cell_Right', alignment=TA_RIGHT, fontSize=7, fontName='Helvetica'))
    styles.add(ParagraphStyle(name='Message_Style', alignment=TA_LEFT, fontSize=7, fontName='Helvetica', textColor=red))
    styles.add(ParagraphStyle(name='Message_Good', alignment=TA_LEFT, fontSize=7, fontName='Helvetica', textColor=green))
    styles.add(ParagraphStyle(name='Message_Neutral', alignment=TA_LEFT, fontSize=7, fontName='Helvetica', textColor=blue))


    story = []

    # Header
    story.append(Paragraph("Relatório de Consumo de Água - Últimos 24 Meses", styles['H1_Center']))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(f"<b>Unidade:</b> {unit_data['codigo_lote']} (Código: {unit_data['codigo_lote']})", styles['H2_Left']))
    #story.append(Spacer(1, 0.1 * inch))

    # Chart
    if chart_image_buffer:
        img = Image(chart_image_buffer)
        img.drawWidth = 10.5 * inch # Aumentar largura para caber em paisagem
        img.drawHeight = 3.5 * inch # Ajustar altura
        story.append(img)
        story.append(Spacer(1, 0.2 * inch))

    # Data Table (Horizontal/Pivotada)
    # Reestruturar os dados da tabela para o formato horizontal
    table_headers_row = ["Mês"]
    consumo_row = ["Consumo (m³)"]
    mediana_row = ["Mediana (m³)"]
    ranking_row = ["Ranking"]
    custo_row = ["Custo (R$)"]
    avaliacao_row = ["Avaliação"]

    # Coletar dados dos 24 meses e preencher as linhas
    # A view já fornece mes01_ é o mais recente, mes24_ é o mais antigo.
    # Para exibir do mais antigo para o mais recente, vamos iterar de 24 a 1.
    for i in range(24, 0, -1): # Itera de 24 (mais antigo) para 1 (mais recente)
        mes_data_display = unit_data.get(f'mes{i:02d}_data_display')
        mes_consumo = unit_data.get(f'mes{i:02d}_consumo')
        mes_mediana = unit_data.get(f'mes{i:02d}_mediana')
        mes_ranking = unit_data.get(f'mes{i:02d}_ranking')
        mes_total_conta = unit_data.get(f'mes{i:02d}_total_conta')
        mes_mensagem = unit_data.get(f'mes{i:02d}_mensagem')

        if mes_data_display:
            table_headers_row.append(str(mes_data_display))
            consumo_row.append(f"{mes_consumo}" if mes_consumo is not None else "-")
            mediana_row.append(f"{mes_mediana:.0f}" if mes_mediana is not None else "-")
            ranking_row.append(str(mes_ranking) if mes_ranking is not None else "-")
            custo_row.append(f"{mes_total_conta:.0f}" if mes_total_conta is not None else "-")
            
            message_style_for_cell = styles['Cell_Center'] # Default style for message cell
            if mes_mensagem:
                if 'Recomendavel' in mes_mensagem or 'Muito acima' in mes_mensagem:
                    message_style_for_cell = styles['Message_Style'] # Red for high consumption
                elif 'Consumo abaixo' in mes_mensagem:
                    message_style_for_cell = styles['Message_Good'] # Green for low consumption
                elif 'Consumo na mediana' in mes_mensagem:
                    message_style_for_cell = styles['Message_Neutral'] # Blue for median consumption
            
            # Adiciona o Paragraph com o estilo correto à lista de avaliações
            avaliacao_row.append(Paragraph(mes_mensagem if mes_mensagem else "-", message_style_for_cell))
        else:
            # Adicionar placeholders para meses sem dados para manter a estrutura da tabela
            table_headers_row.append("-")
            consumo_row.append("-")
            mediana_row.append("-")
            ranking_row.append("-")
            custo_row.append("-")
            avaliacao_row.append("-")


    table_data = [
        table_headers_row,
        consumo_row,
        mediana_row,
        ranking_row,
        custo_row,
        avaliacao_row
    ]
    
    # Definir larguras de coluna dinamicamente: 1 polegadas para a primeira coluna (label), e o restante dividido
    num_data_columns = len(table_headers_row) - 1 # Número de colunas de dados (meses)
    data_column_width = (landscape(A4)[0] - 1.0*inch - 0.5*inch) / num_data_columns if num_data_columns > 0 else 0.5*inch # Largura total da página - margens - largura da primeira coluna
    
    col_widths = [0.9*inch] + [data_column_width] * num_data_columns # Primeira coluna mais larga, o resto igual

    if len(table_headers_row) > 1: # Se houver pelo menos um mês de dados
        table = Table(table_data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), lightgrey), # Cabeçalho da tabela (Mês, Mês, Mês...)
            ('TEXTCOLOR', (0, 0), (-1, 0), black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (1, 0), (-1, 0), 6), # Tamanho da fonte dos data_ref
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), white), # Fundo branco para as linhas de dados
            ('GRID', (0, 0), (-1, -1), 0.5, black), # Todas as bordas
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'), # Deixar labels das linhas em negrito
            ('FONTSIZE', (0, 1), (0, -1), 9), # Tamanho da fonte das labels das linhas
            ('FONTSIZE', (1, 2), (-1, -1), 8), # Tamanho da fonte das labels das linhas
            ('ALIGN', (0, 1), (0, -1), 'LEFT'), # Alinhar labels das linhas à esquerda
            ('LEFTPADDING', (0,0), (-1,-1), 3),
            ('RIGHTPADDING', (0,0), (-1,-1), 3),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(table)
    else:
        story.append(Paragraph("Não há dados de consumo disponíveis para esta unidade no período.", styles['Normal_Left']))

    doc.build(story)
    buffer.seek(0)
    return buffer
