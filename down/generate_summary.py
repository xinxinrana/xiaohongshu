import os

def generate_summary_md(target_dir, output_file):
    """
    遍历指定目录下的子文件夹，读取文案并关联图片，生成汇总的 Markdown 文档。
    
    参数:
    target_dir (str): 包含子文件夹的根目录路径（如 Outputs）。
    output_file (str): 生成的 Markdown 文件路径。
    """
    if not os.path.exists(target_dir):
        print(f"错误: 目录 {target_dir} 不存在。")
        return

    markdown_content = "# 项目内容整理汇总\n\n"
    markdown_content += "> 本文档自动汇总了各个文件夹下的文案内容与已下载的图片。\n\n---\n\n"

    # 获取并排序子文件夹，确保按 1-9 的顺序排列
    folders = [d for d in os.listdir(target_dir) if os.path.isdir(os.path.join(target_dir, d))]
    folders.sort(key=lambda x: int(x.split('_')[0]) if x.split('_')[0].isdigit() else 999)

    for folder in folders:
        folder_path = os.path.join(target_dir, folder)
        markdown_content += f"## {folder}\n\n"
        
        # 1. 处理文案内容
        md_file_path = os.path.join(folder_path, "文案.md")
        if os.path.exists(md_file_path):
            try:
                with open(md_file_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    
                    # 优化文案渲染：
                    # 1. 将文案中的所有以 # 开头的行（包括标题和话题）转为普通加粗文本或转义
                    # 这样可以避免话题被误认为标题，同时保持字体大小一致
                    lines = content.split('\n')
                    processed_lines = []
                    for line in lines:
                        if line.strip().startswith('#'):
                            # 使用 r'\#' 避免 Python 的转义警告，确保 Markdown 中输出 \#
                            # 这样话题和原标题都会变成普通文本，字体大小保持一致
                            processed_line = line.replace('#', r'\#', 1)
                            processed_lines.append(processed_line)
                        else:
                            processed_lines.append(line)
                    content = '\n'.join(processed_lines)

                    markdown_content += "### 📝 文案内容\n\n"
                    markdown_content += f"{content}\n\n"
            except Exception as e:
                markdown_content += f"### 📝 文案内容\n\n*(读取文案失败: {e})*\n\n"
        else:
            markdown_content += "### 📝 文案内容\n\n*(未找到文案文件)*\n\n"

        # 2. 处理图片展示
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        images.sort() # 按 image_1, image_2 排序
        
        if images:
            markdown_content += "### 🖼️ 图片展示\n\n"
            for img in images:
                # 使用相对路径，方便在 Markdown 中预览
                relative_img_path = os.path.join("Outputs", folder, img).replace("\\", "/")
                # 使用 HTML 标签以支持 zoom 缩放属性
                markdown_content += f'<img src="{relative_img_path}" alt="{img}" style="zoom:22%;" /> '
            markdown_content += "\n\n"
        else:
            markdown_content += "### 🖼️ 图片展示\n\n*(暂无图片)*\n\n"

        # 添加更多空行和分割线，增加文章之间的间隔
        markdown_content += "\n\n<br>\n\n---\n\n<br>\n\n"

    # 写入最终的 Markdown 文件
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"成功生成汇总文档: {output_file}")
    except Exception as e:
        print(f"写入文件失败: {e}")

if __name__ == "__main__":
    # 设定目标目录为 Outputs
    base_dir = os.path.join(os.getcwd(), "Outputs")
    output_md = os.path.join(os.getcwd(), "项目内容整理.md")
    generate_summary_md(base_dir, output_md)
