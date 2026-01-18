import os
import urllib.request
import re

def download_images_in_folders(base_dir):
    """
    遍历指定目录下的子文件夹，查找包含图片URL的文本文件并下载图片。
    
    参数:
    base_dir (str): 包含子文件夹的根目录路径。
    """
    if not os.path.exists(base_dir):
        print(f"错误: 目录 {base_dir} 不存在。")
        return

    # 遍历根目录下的所有子项
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            # 查找以 image_ 开头并以 _url.txt 结尾的文件
            if file.startswith("image_") and file.endswith("_url.txt"):
                file_path = os.path.join(root, file)
                
                try:
                    # 读取文件内容获取 URL
                    with open(file_path, 'r', encoding='utf-8') as f:
                        url = f.read().strip()
                    
                    if not url:
                        print(f"跳过空文件: {file_path}")
                        continue

                    # 处理一些特殊的格式，比如 "1→http..."
                    if "→" in url:
                        url = url.split("→")[-1].strip()

                    # 确定保存的文件名
                    # 将 image_1_url.txt 转换为 image_1.jpg
                    image_name = file.replace("_url.txt", ".jpg")
                    image_path = os.path.join(root, image_name)
                    
                    print(f"正在下载: {url} -> {image_path}")
                    
                    # 执行下载
                    headers = {'User-Agent': 'Mozilla/5.0'}
                    req = urllib.request.Request(url, headers=headers)
                    with urllib.request.urlopen(req) as response, open(image_path, 'wb') as out_file:
                        out_file.write(response.read())
                        
                    print(f"成功下载到: {image_path}")
                except Exception as e:
                    print(f"处理文件 {file_path} 时出错: {e}")

if __name__ == "__main__":
    # 针对 16 文件夹进行操作
    target_directory = os.path.join(os.getcwd(), "18")
    download_images_in_folders(target_directory)
