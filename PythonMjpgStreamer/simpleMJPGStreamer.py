import cv2
from PIL import Image
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import StringIO
import time
import os
import socket

if os.name != "nt":
    import fcntl
    import struct

    def get_interface_ip(ifname):
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(s.fileno(), 0x8915, struct.pack('256s',
                                ifname[:15]))[20:24])

    def get_lan_ip():
        ip = socket.gethostbyname(socket.gethostname())
        if ip.startswith("127.") and os.name != "nt":
            interfaces = [
                "eth0",
                "eth1",
                "eth2",
                "wlan0",
                "wlan1",
                "wifi0",
                "ath0",
                "ath1",
                "ppp0",
                ]
            for ifname in interfaces:
                try:
                    ip = get_interface_ip(ifname)
                    break
                except IOError:
                    pass
        return ip

capture=None


class CamHandler(BaseHTTPRequestHandler):
  def do_GET(self):
    if self.path.endswith('.mjpg'):
      self.send_response(200)
      self.send_header('Content-type','multipart/x-mixed-replace; boundary=--jpgboundary')
      self.end_headers()
      while True:
        try:
          rc,img = capture.read()
          if not rc:
            continue
          imgRGB=cv2.cvtColor(img,cv2.COLOR_BGR2RGB)
          jpg = Image.fromarray(imgRGB)
          tmpFile = StringIO.StringIO()
          jpg.save(tmpFile,'JPEG')
          self.wfile.write("--jpgboundary")
          self.send_header('Content-type','image/jpeg')
          self.send_header('Content-length',str(tmpFile.len))
          self.end_headers()
          jpg.save(self.wfile,'JPEG')
          # time.sleep(0.05)
        except KeyboardInterrupt:
          break
      return
    if self.path.endswith('.html'):
      self.send_response(200)
      self.send_header('Content-type','text/html')
      self.end_headers()
      self.wfile.write('<html><head></head><body>')
      self.wfile.write('<img src="http://127.0.0.1:8080/cam.mjpg"/>')
      self.wfile.write('</body></html>')
      return

def main():
  global capture
  capture = cv2.VideoCapture(0)
  capture.set(cv2.cv.CV_CAP_PROP_FRAME_WIDTH, 640); 
  capture.set(cv2.cv.CV_CAP_PROP_FRAME_HEIGHT, 480);
  capture.set(cv2.cv.CV_CAP_PROP_SATURATION,0.2);
  global img
  try:
    toUseIP = get_lan_ip()
    server = HTTPServer((toUseIP,8080),CamHandler)
    sa = server.socket.getsockname()
    print "server started at %s,port:%d" % (toUseIP,sa[1])
    server.serve_forever()
  except KeyboardInterrupt:
    capture.release()
    server.socket.close()

if __name__ == '__main__':
  main()